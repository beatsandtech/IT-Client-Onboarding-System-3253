import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {
  FiUsers,
  FiUserCheck,
  FiUserPlus,
  FiPieChart,
  FiCalendar,
  FiAlertCircle,
  FiSearch,
  FiFilter,
  FiUser
} = FiIcons;

function AdminDashboard() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Stats for admin dashboard
  const [stats, setStats] = useState({
    totalClients: 0,
    activeOnboardings: 0,
    completedOnboardings: 0,
    pendingDocuments: 0
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        
        // Fetch all clients with their onboarding status
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id, 
            full_name, 
            email, 
            created_at,
            onboarding_status,
            client_info:client_details(*)
          `)
          .eq('role', 'client');
          
        if (error) throw error;
        
        setClients(data || []);
        
        // Calculate statistics
        if (data) {
          setStats({
            totalClients: data.length,
            activeOnboardings: data.filter(c => c.onboarding_status === 'in_progress').length,
            completedOnboardings: data.filter(c => c.onboarding_status === 'completed').length,
            pendingDocuments: data.filter(c => c.onboarding_status === 'documents_pending').length
          });
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        setError('Failed to load client data');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [user]);

  // Filter clients based on search query and status filter
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.client_info?.companyName?.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesFilter = 
      filterStatus === 'all' || 
      client.onboarding_status === filterStatus;
      
    return matchesSearch && matchesFilter;
  });

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
      case 'documents_pending': return 'Docs Pending';
      case 'not_started': return 'Not Started';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage client onboarding and track progress</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center">
          <SafeIcon icon={FiAlertCircle} className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <SafeIcon icon={FiUsers} className="text-xl" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Clients</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.totalClients}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl shadow p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <SafeIcon icon={FiUserCheck} className="text-xl" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Completed Onboardings</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.completedOnboardings}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-xl shadow p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <SafeIcon icon={FiUserPlus} className="text-xl" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Active Onboardings</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.activeOnboardings}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-xl shadow p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
              <SafeIcon icon={FiPieChart} className="text-xl" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Pending Documents</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.pendingDocuments}</p>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients..."
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiFilter} className="text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="documents_pending">Documents Pending</option>
              <option value="not_started">Not Started</option>
            </select>
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Client List</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <SafeIcon icon={FiUser} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{client.full_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.client_info?.companyName || 'Not specified'}</div>
                      <div className="text-sm text-gray-500">{client.client_info?.industry || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(client.onboarding_status)}`}>
                        {getStatusLabel(client.onboarding_status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/admin/client/${client.id}`} className="text-blue-600 hover:text-blue-900">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No clients found matching your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="mt-8 bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Upcoming Tasks</h2>
          <SafeIcon icon={FiCalendar} className="text-blue-500 text-xl" />
        </div>
        
        <div className="space-y-3">
          {[
            { client: 'ABC Corp', task: 'Technical Assessment', date: '2024-06-15', priority: 'high' },
            { client: 'XYZ Industries', task: 'Contract Review', date: '2024-06-16', priority: 'medium' },
            { client: 'Tech Innovators', task: 'Service Setup', date: '2024-06-18', priority: 'low' }
          ].map((task, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow duration-200">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-full rounded-full ${
                  task.priority === 'high' ? 'bg-red-500' : 
                  task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div>
                  <p className="font-medium text-gray-800">{task.task}</p>
                  <p className="text-sm text-gray-600">Client: {task.client}</p>
                </div>
              </div>
              <div className="text-gray-600 text-sm">
                {new Date(task.date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;