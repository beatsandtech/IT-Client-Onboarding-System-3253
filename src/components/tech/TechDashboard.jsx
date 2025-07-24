import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiActivity, FiCheckSquare, FiClock, FiCalendar, FiAlertCircle, FiUser, FiSearch } = FiIcons;

function TechDashboard() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');
  
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({
    pendingTasks: 0,
    completedTasks: 0,
    upcomingAssessments: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch clients with active onboarding
        const { data: clientsData, error: clientsError } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            email,
            created_at,
            onboarding_status,
            client_info:client_details(*)
          `)
          .eq('role', 'client')
          .in('onboarding_status', ['in_progress', 'documents_pending']);
          
        if (clientsError) throw clientsError;
        
        // Fetch tech assignments
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('tech_assignments')
          .select(`
            id,
            client_id,
            task_name,
            task_description,
            status,
            priority,
            due_date,
            assigned_to,
            client:profiles(full_name, email)
          `)
          .eq('assigned_to', user.id);
          
        if (assignmentsError) throw assignmentsError;
        
        setClients(clientsData || []);
        setAssignments(assignmentsData || []);
        
        // Calculate stats
        if (assignmentsData) {
          setStats({
            pendingTasks: assignmentsData.filter(task => task.status === 'pending').length,
            completedTasks: assignmentsData.filter(task => task.status === 'completed').length,
            upcomingAssessments: assignmentsData.filter(task => 
              task.status === 'pending' && 
              task.task_name.toLowerCase().includes('assessment')
            ).length
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const { error } = await supabase
        .from('tech_assignments')
        .update({ status: newStatus })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Update local state
      setAssignments(assignments.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      
      // Update stats
      setStats({
        ...stats,
        pendingTasks: newStatus === 'completed' ? stats.pendingTasks - 1 : stats.pendingTasks + 1,
        completedTasks: newStatus === 'completed' ? stats.completedTasks + 1 : stats.completedTasks - 1
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  // Filter assignments based on search and status filter
  const filteredAssignments = assignments.filter(task => {
    const matchesSearch = 
      task.task_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      task.client.full_name.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesFilter = 
      taskFilter === 'all' || 
      task.status === taskFilter;
      
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
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
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Technician Dashboard</h1>
        <p className="text-gray-600">Manage your assigned tasks and client implementations</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-center">
          <SafeIcon icon={FiAlertCircle} className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <SafeIcon icon={FiActivity} className="text-xl" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Pending Tasks</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.pendingTasks}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl shadow p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <SafeIcon icon={FiCheckSquare} className="text-xl" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Completed Tasks</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.completedTasks}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-xl shadow p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
              <SafeIcon icon={FiClock} className="text-xl" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Upcoming Assessments</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.upcomingAssessments}</p>
        </motion.div>
      </div>

      {/* Task Management */}
      <div className="bg-white rounded-xl shadow overflow-hidden mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">My Tasks</h2>
        </div>
        
        <div className="p-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="relative flex-grow max-w-md">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div className="flex space-x-2">
              {['all', 'pending', 'in_progress', 'completed'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setTaskFilter(filter)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    taskFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1).replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tasks List */}
          {filteredAssignments.length > 0 ? (
            <div className="space-y-4">
              {filteredAssignments.map((task) => (
                <div key={task.id} className="border rounded-lg hover:shadow-sm transition-shadow duration-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-800">{task.task_name}</h3>
                        <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority} priority
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 flex items-center">
                          <SafeIcon icon={FiCalendar} className="mr-1" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                          className="text-sm px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{task.task_description}</p>
                    
                    <div className="flex items-center">
                      <SafeIcon icon={FiUser} className="text-blue-500 mr-2" />
                      <div>
                        <span className="text-sm text-gray-500">Client:</span>
                        <Link 
                          to={`/admin/client/${task.client_id}`} 
                          className="ml-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          {task.client.full_name}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <SafeIcon icon={FiActivity} className="text-gray-300 text-5xl mx-auto mb-4" />
              <p className="text-gray-600">
                {searchQuery || taskFilter !== 'all' 
                  ? 'No matching tasks found' 
                  : 'No tasks assigned to you yet'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Active Onboarding Clients */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Active Onboarding Clients</h2>
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.length > 0 ? (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <SafeIcon icon={FiUser} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{client.full_name}</div>
                          <div className="text-sm text-gray-500">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.client_info?.companyName || 'Not specified'}</div>
                      <div className="text-sm text-gray-500">{client.client_info?.industry || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        client.onboarding_status === 'in_progress' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {client.onboarding_status === 'in_progress' ? 'In Progress' : 'Docs Pending'}
                      </span>
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
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No active onboarding clients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TechDashboard;