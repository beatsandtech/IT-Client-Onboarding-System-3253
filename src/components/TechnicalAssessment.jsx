import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOnboarding } from '../context/OnboardingContext';
import ProgressBar from './ProgressBar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight, FiArrowLeft, FiServer, FiMonitor, FiWifi, FiShield } = FiIcons;

function TechnicalAssessment() {
  const { state, dispatch } = useOnboarding();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(state.technicalAssessment);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked 
        ? [...(prev[name] || []), value]
        : (prev[name] || []).filter(item => item !== value)
    }));
  };

  const handleContinue = () => {
    dispatch({ type: 'UPDATE_ASSESSMENT', payload: formData });
    dispatch({ type: 'SET_STEP', payload: 4 });
    navigate('/timeline');
  };

  const handleBack = () => {
    dispatch({ type: 'SET_STEP', payload: 2 });
    navigate('/services');
  };

  const operatingSystems = ['Windows', 'macOS', 'Linux', 'Mixed Environment'];
  const networkSizes = ['1-10 devices', '11-50 devices', '51-100 devices', '100+ devices'];
  const cloudServices = ['Microsoft 365', 'Google Workspace', 'AWS', 'Azure', 'None'];

  return (
    <div className="max-w-2xl mx-auto">
      <ProgressBar currentStep={3} totalSteps={6} />
      
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Technical Assessment</h2>
          <p className="text-gray-600">Help us understand your current IT infrastructure</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiServer} className="inline mr-2" />
              Current Infrastructure Description
            </label>
            <textarea
              name="currentInfrastructure"
              value={formData.currentInfrastructure}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Describe your current IT setup, servers, workstations, etc."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiMonitor} className="inline mr-2" />
                Primary Operating System
              </label>
              <select
                name="operatingSystem"
                value={formData.operatingSystem}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select OS</option>
                {operatingSystems.map(os => (
                  <option key={os} value={os}>{os}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiWifi} className="inline mr-2" />
                Network Size
              </label>
              <select
                name="networkSize"
                value={formData.networkSize}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select network size</option>
                {networkSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <SafeIcon icon={FiShield} className="inline mr-2" />
              Security Concerns
            </label>
            <textarea
              name="securityConcerns"
              value={formData.securityConcerns}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Any specific security concerns or requirements?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compliance Requirements
            </label>
            <input
              type="text"
              name="complianceRequirements"
              value={formData.complianceRequirements}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="HIPAA, SOX, PCI-DSS, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Backup Solution
            </label>
            <input
              type="text"
              name="backupSolution"
              value={formData.backupSolution}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Describe your current backup strategy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Current Cloud Services (select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {cloudServices.map(service => (
                <label key={service} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="cloudServices"
                    value={service}
                    checked={(formData.cloudServices || []).includes(service)}
                    onChange={handleCheckboxChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{service}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <SafeIcon icon={FiArrowLeft} />
            <span>Back</span>
          </button>
          
          <button
            onClick={handleContinue}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
          >
            <span>Continue</span>
            <SafeIcon icon={FiArrowRight} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default TechnicalAssessment;