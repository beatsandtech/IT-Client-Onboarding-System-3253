import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiFile, FiUpload, FiTrash2, FiCheck, FiAlertCircle, FiArrowLeft, FiDownload, FiEye } = FiIcons;

function DocumentUpload() {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [documentType, setDocumentType] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch documents
        let query = supabase
          .from('documents')
          .select('*');
          
        // If client role, only show their documents
        if (userRole === 'client') {
          query = query.eq('client_id', user.id);
        }
        
        const { data: documentsData, error: documentsError } = await query;
        
        if (documentsError) throw documentsError;
        
        // If admin or tech, fetch clients for dropdown
        if (userRole === 'admin' || userRole === 'tech') {
          const { data: clientsData, error: clientsError } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('role', 'client');
            
          if (clientsError) throw clientsError;
          setClients(clientsData || []);
        }
        
        setDocuments(documentsData || []);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id, userRole]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Add selected files to the state
    setFiles(prev => [
      ...prev,
      ...selectedFiles.map(file => ({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: URL.createObjectURL(file),
        progress: 0
      }))
    ]);
    
    // Reset the input
    e.target.value = null;
  };

  const removeFile = (index) => {
    setFiles(prev => {
      const newFiles = [...prev];
      
      // Revoke object URL to avoid memory leaks
      URL.revokeObjectURL(newFiles[index].preview);
      
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    // For admin/tech, client selection is required
    if ((userRole === 'admin' || userRole === 'tech') && !selectedClient) {
      setError('Please select a client');
      return;
    }
    
    if (!documentType) {
      setError('Please select a document type');
      return;
    }
    
    setUploading(true);
    setError(null);
    setSuccess('');
    
    try {
      const clientId = userRole === 'client' ? user.id : selectedClient;
      
      for (let i = 0; i < files.length; i++) {
        const fileObj = files[i];
        const file = fileObj.file;
        
        // Update progress state
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i] = { ...newFiles[i], progress: 10 };
          return newFiles;
        });
        
        // Create a unique file path
        const filePath = `${clientId}/${documentType}/${Date.now()}_${file.name}`;
        
        // Upload to Storage
        const { error: uploadError } = await supabase.storage
          .from('client_documents')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        // Update progress
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i] = { ...newFiles[i], progress: 70 };
          return newFiles;
        });
        
        // Create a record in the documents table
        const { error: dbError } = await supabase
          .from('documents')
          .insert({
            client_id: clientId,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            storage_path: filePath,
            document_type: documentType,
            uploaded_by: user.id,
            uploaded_at: new Date()
          });
          
        if (dbError) throw dbError;
        
        // Update progress to complete
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i] = { ...newFiles[i], progress: 100 };
          return newFiles;
        });
      }
      
      // Refresh document list
      const { data: newDocuments } = await supabase
        .from('documents')
        .select('*')
        .eq('client_id', clientId);
        
      setDocuments(newDocuments || []);
      
      // Clear files and show success message
      setSuccess(`${files.length} document${files.length > 1 ? 's' : ''} uploaded successfully!`);
      
      // Clear files after short delay to show 100% progress
      setTimeout(() => {
        setFiles([]);
      }, 1500);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  const downloadDocument = async (document) => {
    try {
      const { data, error } = await supabase.storage
        .from('client_documents')
        .download(document.storage_path);
        
      if (error) throw error;
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download document');
    }
  };

  const deleteDocument = async (id) => {
    try {
      // Find document to get storage path
      const document = documents.find(doc => doc.id === id);
      if (!document) return;
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('client_documents')
        .remove([document.storage_path]);
        
      if (storageError) throw storageError;
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);
        
      if (dbError) throw dbError;
      
      // Update state
      setDocuments(documents.filter(doc => doc.id !== id));
      setSuccess('Document deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete document');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getDocumentTypeIcon = (type) => {
    if (type.startsWith('image/')) return FiFile;
    else if (type.includes('pdf')) return FiFile;
    else if (type.includes('word') || type.includes('document')) return FiFile;
    else if (type.includes('sheet') || type.includes('excel')) return FiFile;
    else return FiFile;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center mb-4 md:mb-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 mr-2"
          >
            <SafeIcon icon={FiArrowLeft} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Document Management</h1>
            <p className="text-gray-600">Upload and manage important documents</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center">
          <SafeIcon icon={FiAlertCircle} className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 flex items-center">
          <SafeIcon icon={FiCheck} className="mr-2 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Upload Documents</h2>
        
        {/* Client Selection for Admin/Tech */}
        {(userRole === 'admin' || userRole === 'tech') && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Client</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.full_name} ({client.email})
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Document Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Select document type</option>
            <option value="contract">Contract</option>
            <option value="invoice">Invoice</option>
            <option value="assessment">Technical Assessment</option>
            <option value="network_diagram">Network Diagram</option>
            <option value="id_verification">ID Verification</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        {/* File Drop Area */}
        <div className="mb-6">
          <label 
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <SafeIcon icon={FiUpload} className="text-gray-400 text-3xl mb-3" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PDF, Word, Excel, Images (max. 10MB)</p>
            </div>
            <input 
              id="file-upload" 
              type="file" 
              multiple 
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading} 
            />
          </label>
        </div>
        
        {/* File List */}
        {files.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-3">Selected Files</h3>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <SafeIcon icon={getDocumentTypeIcon(file.type)} className="text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {file.progress > 0 && file.progress < 100 ? (
                      <div className="w-24 bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                    ) : file.progress === 100 ? (
                      <SafeIcon icon={FiCheck} className="text-green-500" />
                    ) : (
                      <button
                        onClick={() => removeFile(index)}
                        disabled={uploading}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      >
                        <SafeIcon icon={FiTrash2} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Upload Button */}
        <div className="flex justify-end">
          <button
            onClick={uploadFiles}
            disabled={files.length === 0 || uploading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></span>
            ) : (
              <>
                <SafeIcon icon={FiUpload} />
                <span>Upload {files.length > 0 ? `(${files.length})` : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Your Documents</h2>
        </div>
        
        <div className="p-6">
          {documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map((doc) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <SafeIcon icon={getDocumentTypeIcon(doc.file_type)} className="text-blue-500 text-xl" />
                    <div>
                      <p className="font-medium text-gray-800">{doc.file_name}</p>
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {doc.document_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => downloadDocument(doc)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
                      title="Download"
                    >
                      <SafeIcon icon={FiDownload} />
                    </button>
                    <button
                      onClick={() => {}}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors duration-200"
                      title="View"
                    >
                      <SafeIcon icon={FiEye} />
                    </button>
                    {(userRole === 'admin' || (userRole === 'client' && doc.uploaded_by === user.id)) && (
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                        title="Delete"
                      >
                        <SafeIcon icon={FiTrash2} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <SafeIcon icon={FiFile} className="text-gray-300 text-5xl mx-auto mb-4" />
              <p className="text-gray-600">No documents found</p>
              <p className="text-sm text-gray-500 mt-2">Upload documents to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentUpload;