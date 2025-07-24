import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOnboarding } from '../context/OnboardingContext';
import ProgressBar from './ProgressBar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight, FiArrowLeft, FiServer, FiShield, FiCloud, FiMonitor, FiWifi, FiHardDrive } = FiIcons;

function ServiceSelection() {
  const { state, dispatch } = useOnboarding();
  const navigate = useNavigate();
  const [selectedServices, setSelectedServices] = useState(state.selectedServices);

  const services = [
    {
      id: 'managed-it',
      icon: FiMonitor,
      title: 'Managed IT Services',
      description: 'Complete IT infrastructure management and support',
      features: ['24/7 monitoring', 'Help desk support', 'System maintenance'],
      price: '$150/month per user'
    },
    {
      id: 'cybersecurity',
      icon: FiShield,
      title: 'Cybersecurity Solutions',
      description: 'Comprehensive security protection for your business',
      features: ['Threat monitoring', 'Firewall management', 'Security training'],
      price: '$200/month base'
    },
    {
      id: 'cloud-services',
      icon: FiCloud,
      title: 'Cloud Migration & Management',
      description: 'Move to the cloud with expert guidance and ongoing support',
      features: ['Cloud strategy', 'Migration planning', 'Ongoing optimization'],
      price: 'Custom pricing'
    },
    {
      id: 'network-setup',
      icon: FiWifi,
      title: 'Network Setup & Optimization',
      description: 'Design and implement robust network infrastructure',
      features: ['Network design', 'Hardware installation', 'Performance optimization'],
      price: '$2,500+ one-time'
    },
    {
      id: 'backup-recovery',
      icon: FiHardDrive,
      title: 'Backup & Disaster Recovery',
      description: 'Protect your data with automated backup solutions',
      features: ['Automated backups', 'Disaster recovery planning', 'Data restoration'],
      price: '$100/month base'
    },
    {
      id: 'server-management',
      icon: FiServer,
      title: 'Server Management',
      description: 'Professional server setup, maintenance, and monitoring',
      features: ['Server installation', 'Performance monitoring', 'Updates & patches'],
      price: '$300/month per server'
    }
  ];

  const toggleService = (serviceId) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleContinue = () => {
    dispatch({ type: 'UPDATE_SERVICES', payload: selectedServices });
    dispatch({ type: 'SET_STEP', payload: 3 });
    navigate('/assessment');
  };

  const handleBack = () => {
    dispatch({ type: 'SET_STEP', payload: 1 });
    navigate('/onboarding');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ProgressBar currentStep={2} totalSteps={6} />
      
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Select Your Services</h2>
          <p className="text-gray-600">Choose the IT services that best fit your business needs</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedServices.includes(service.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleService(service.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  selectedServices.includes(service.id) 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <SafeIcon icon={service.icon} className="text-xl" />
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedServices.includes(service.id)
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedServices.includes(service.id) && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              
              <ul className="space-y-1 mb-4">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-gray-500 flex items-center">
                    <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div className="text-blue-600 font-semibold">{service.price}</div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <SafeIcon icon={FiArrowLeft} />
            <span>Back</span>
          </button>
          
          <button
            onClick={handleContinue}
            disabled={selectedServices.length === 0}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span>Continue</span>
            <SafeIcon icon={FiArrowRight} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default ServiceSelection;