import React from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '../context/OnboardingContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiSettings, FiBarChart, FiCalendar, FiDollarSign, FiShield } = FiIcons;

function Dashboard() {
  const { state } = useOnboarding();

  const stats = [
    {
      icon: FiDollarSign,
      title: 'Monthly Investment',
      value: `$${state.contractDetails.monthlyFee}`,
      color: 'green'
    },
    {
      icon: FiSettings,
      title: 'Active Services',
      value: state.selectedServices.length,
      color: 'blue'
    },
    {
      icon: FiShield,
      title: 'Service Level',
      value: state.contractDetails.serviceLevel,
      color: 'purple'
    },
    {
      icon: FiCalendar,
      title: 'Support Hours',
      value: state.contractDetails.supportHours,
      color: 'orange'
    }
  ];

  const recentActivity = [
    { date: '2024-01-15', action: 'Onboarding completed', status: 'completed' },
    { date: '2024-01-15', action: 'Contract signed', status: 'completed' },
    { date: '2024-01-16', action: 'Kick-off meeting scheduled', status: 'pending' },
    { date: '2024-01-18', action: 'Technical assessment planned', status: 'upcoming' }
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {state.clientInfo.contactPerson}
        </h1>
        <p className="text-gray-600">
          Here's an overview of your IT services with TechSolutions Pro
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                <SafeIcon icon={stat.icon} className="text-xl" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <SafeIcon icon={FiBarChart} className="mr-2" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  activity.status === 'completed' ? 'bg-green-500' :
                  activity.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.date}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activity.status === 'completed' ? 'bg-green-100 text-green-600' :
                  activity.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <SafeIcon icon={FiUser} className="mr-2" />
            Account Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Company</label>
              <p className="text-gray-800">{state.clientInfo.companyName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Industry</label>
              <p className="text-gray-800">{state.clientInfo.industry}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Company Size</label>
              <p className="text-gray-800">{state.clientInfo.companySize}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-800">{state.clientInfo.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Phone</label>
              <p className="text-gray-800">{state.clientInfo.phone}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
            <SafeIcon icon={FiCalendar} className="text-blue-500 text-xl mb-2" />
            <p className="font-medium text-gray-800">Schedule Support</p>
          </button>
          <button className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
            <SafeIcon icon={FiSettings} className="text-blue-500 text-xl mb-2" />
            <p className="font-medium text-gray-800">Service Requests</p>
          </button>
          <button className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200">
            <SafeIcon icon={FiBarChart} className="text-blue-500 text-xl mb-2" />
            <p className="font-medium text-gray-800">View Reports</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;