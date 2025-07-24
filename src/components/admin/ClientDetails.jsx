import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiUser, FiMail, FiPhone, FiCalendar, FiFileText, FiEdit, 
  FiCheckCircle, FiArrowLeft, FiAlertCircle, FiMessageCircle, 
  FiClock, FiPaperclip, FiTrendingUp, FiDownload
} = FiIcons;

function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch client profile and associated data
        const { data: clientData, error: clientError } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            email,
            created_at,
            onboarding_status,
            client_info:client_details(*)
          `)
          .eq('id', id)
          .single();
          
        if (clientError) throw clientError;
        
        // Fetch client documents
        const { data: docsData, error: docsError } = await supabase
          .from('documents')
          .select('*')
          .eq('client_id', id);
          
        if (docsError) throw docsError;
        
        // Fetch client notes
        const { data: notesData, error: notesError } = await supabase
          .from('client_notes')
          .select('*')
          .eq('client_id', id)
          .order('created_at', { ascending: false });
          
        if (notesError) throw notesError;
        
        setClient(clientData);
        setDocuments(docsData || []);
        setNotes(notesData || []);
      } catch (error) {
        console.error('Error fetching client details:', error);
        setError('Failed to load client data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClientDetails();
    }
  }, [id]);

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from('client_notes')
        .insert({
          client_id: id,
          note_text: newNote,
          created_by: 'admin', // In a real app, use the current user's ID
          created_at: new Date()
        })
        .select();
        
      if (error) throw error;
      
      // Add the new note to the state
      if (data) {
        setNotes([data[0], ...notes]);
        setNewNote('');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      setError('Failed to add note');
    }
  };

  const updateOnboardingStatus = async (status) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_status: status })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setClient({ ...client, onboarding_status: status });
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'documents_pending': return 'bg-yellow-100 text-yellow-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      case 'documents_pending': return 'Documents Pending';
      case 'not_started': return 'Not Started';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center">
          <SafeIcon icon={FiAlertCircle} className="mr-2 flex-shrink-0" />
          <span>{error || 'Client not found'}</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          <SafeIcon icon={FiArrowLeft} />
          <span>Back</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <SafeIcon icon={FiArrowLeft} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {client.client_info?.companyName || client.full_name}
            </h1>
            <p className="text-gray-600">Client ID: {client.id.substring(0, 8)}...</p>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(client.onboarding_status)}`}>
            {getStatusLabel(client.onboarding_status)}
          </span>
          <button className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200">
            <SafeIcon icon={FiEdit} className="text-sm" />
            <span>Edit</span>
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b">
        <nav className="flex space-x-6">
          {['overview', 'documents', 'notes', 'timeline'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-1 font-medium capitalize ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-lg">
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Client Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Client Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <SafeIcon icon={FiUser} className="text-blue-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="font-medium">{client.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <SafeIcon icon={FiMail} className="text-blue-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-medium">{client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <SafeIcon icon={FiPhone} className="text-blue-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium">{client.client_info?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <SafeIcon icon={FiCalendar} className="text-blue-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Registration Date</p>
                      <p className="font-medium">{formatDate(client.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Company Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Company Information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Company Name</p>
                    <p className="font-medium">{client.client_info?.companyName || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Industry</p>
                    <p className="font-medium">{client.client_info?.industry || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Company Size</p>
                    <p className="font-medium">{client.client_info?.companySize || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Previous IT Provider</p>
                    <p className="font-medium">{client.client_info?.currentProvider || 'None'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Services */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Selected Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {client.client_info?.selectedServices?.map((service, index) => (
                  <div key={index} className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <SafeIcon icon={FiCheckCircle} className="text-blue-500" />
                      <span className="font-medium">{service}</span>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-600">No services selected</p>
                )}
              </div>
            </div>
            
            {/* Update Status */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Update Onboarding Status</h3>
              <div className="flex flex-wrap gap-3">
                {['not_started', 'in_progress', 'documents_pending', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateOnboardingStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      client.onboarding_status === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {getStatusLabel(status)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'documents' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Client Documents</h2>
              <Link
                to="/documents"
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <SafeIcon icon={FiPaperclip} className="text-sm" />
                <span>Upload Documents</span>
              </Link>
            </div>
            
            {documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <SafeIcon icon={FiFileText} className="text-blue-500" />
                      <div>
                        <p className="font-medium">{doc.file_name}</p>
                        <p className="text-sm text-gray-500">{formatDate(doc.uploaded_at)}</p>
                      </div>
                    </div>
                    <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors duration-200">
                      <SafeIcon icon={FiDownload} />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <SafeIcon icon={FiFileText} className="text-gray-300 text-5xl mx-auto mb-4" />
                <p className="text-gray-600">No documents uploaded yet</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'notes' && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Client Notes</h2>
            
            {/* Add Note Form */}
            <div className="mb-8">
              <div className="flex space-x-3">
                <div className="flex-grow">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this client..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    rows={3}
                  />
                </div>
                <button
                  onClick={addNote}
                  disabled={!newNote.trim()}
                  className="self-end flex-shrink-0 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Note
                </button>
              </div>
            </div>
            
            {/* Notes List */}
            <div className="space-y-6">
              {notes.length > 0 ? (
                notes.map((note) => (
                  <div key={note.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <SafeIcon icon={FiMessageCircle} className="text-blue-500" />
                        <span className="font-medium">{note.created_by || 'Admin'}</span>
                      </div>
                      <span className="text-sm text-gray-500 flex items-center">
                        <SafeIcon icon={FiClock} className="mr-1" />
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-700">{note.note_text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <SafeIcon icon={FiMessageCircle} className="text-gray-300 text-5xl mx-auto mb-4" />
                  <p className="text-gray-600">No notes added yet</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'timeline' && (
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Onboarding Timeline</h2>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-5 bottom-0 w-0.5 bg-gray-200"></div>
              
              {/* Timeline events */}
              <div className="space-y-8 relative">
                {[
                  { 
                    title: 'Account Created', 
                    date: client.created_at, 
                    description: 'Client registered an account', 
                    status: 'completed' 
                  },
                  { 
                    title: 'Onboarding Started', 
                    date: client.client_info?.created_at, 
                    description: 'Client started the onboarding process', 
                    status: 'completed' 
                  },
                  { 
                    title: 'Service Selection', 
                    date: null, 
                    description: 'Client selected IT services', 
                    status: client.client_info?.selectedServices?.length > 0 ? 'completed' : 'pending'
                  },
                  { 
                    title: 'Technical Assessment', 
                    date: null, 
                    description: 'Completed IT infrastructure assessment', 
                    status: client.client_info?.technicalAssessment?.currentInfrastructure ? 'completed' : 'pending' 
                  },
                  { 
                    title: 'Contract Signed', 
                    date: null, 
                    description: 'Service agreement accepted', 
                    status: 'pending' 
                  },
                  { 
                    title: 'Implementation', 
                    date: null, 
                    description: 'Service implementation and setup', 
                    status: 'upcoming' 
                  }
                ].map((event, index) => (
                  <div key={index} className="flex space-x-4">
                    <div className="flex-shrink-0 relative z-10">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        event.status === 'completed' 
                          ? 'bg-green-100 text-green-600' 
                          : event.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <SafeIcon 
                          icon={
                            event.status === 'completed' 
                              ? FiCheckCircle 
                              : event.status === 'pending'
                              ? FiClock
                              : FiTrendingUp
                          } 
                          className="text-xl" 
                        />
                      </div>
                    </div>
                    <div className="flex-grow pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-800">{event.title}</h3>
                        {event.date && (
                          <span className="text-sm text-gray-500">{formatDate(event.date)}</span>
                        )}
                      </div>
                      <p className="text-gray-600">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientDetails;