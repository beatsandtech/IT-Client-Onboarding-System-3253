import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOnboarding } from '../context/OnboardingContext';
import ProgressBar from './ProgressBar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight, FiArrowLeft, FiDollarSign, FiClock, FiShield, FiCheckCircle } = FiIcons;

function ContractReview() {
  const { state, dispatch } = useOnboarding();
  const navigate = useNavigate();
  const [contractData, setContractData] = useState(state.contractDetails);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    // Calculate pricing based on selected services
    let monthlyFee = 0;
    let setupFee = 500; // Base setup fee

    state.selectedServices.forEach(serviceId => {
      switch (serviceId) {
        case 'managed-it':
          monthlyFee += 150 * (getEmployeeCount() || 10);
          break;
        case 'cybersecurity':
          monthlyFee += 200;
          setupFee += 300;
          break;
        case 'cloud-services':
          monthlyFee += 300;
          setupFee += 1000;
          break;
        case 'backup-recovery':
          monthlyFee += 100;
          break;
        case 'server-management':
          monthlyFee += 300;
          break;
        default:
          break;
      }
    });

    setContractData(prev => ({
      ...prev,
      monthlyFee,
      setupFee,
      serviceLevel: 'Business',
      supportHours: '24/7',
      responseTime: '4 hours'
    }));
  }, [state.selectedServices]);

  const getEmployeeCount = () => {
    const sizeMapping = {
      '1-10 employees': 10,
      '11-50 employees': 50,
      '51-200 employees': 200,
      '201-500 employees': 500,
      '500+ employees': 1000
    };
    return sizeMapping[state.clientInfo.companySize] || 10;
  };

  const handleContinue = () => {
    if (!agreed) return;
    
    dispatch({ type: 'UPDATE_CONTRACT', payload: contractData });
    dispatch({ type: 'SET_STEP', payload: 6 });
    navigate('/completion');
  };

  const handleBack = () => {
    dispatch({ type: 'SET_STEP', payload: 4 });
    navigate('/timeline');
  };

  const selectedServiceNames = {
    'managed-it': 'Managed IT Services',
    'cybersecurity': 'Cybersecurity Solutions',
    'cloud-services': 'Cloud Migration & Management',
    'network-setup': 'Network Setup & Optimization',
    'backup-recovery': 'Backup & Disaster Recovery',
    'server-management': 'Server Management'
  };

  return (
    <div className="max-w-3xl mx-auto">
      <ProgressBar currentStep={5} totalSteps={6} />
      
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Contract Review</h2>
          <p className="text-gray-600">Review your service agreement and pricing</p>
        </div>

        <div className="space-y-8">
          {/* Company Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Client Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Company:</span>
                <span className="ml-2 text-gray-800">{state.clientInfo.companyName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Contact:</span>
                <span className="ml-2 text-gray-800">{state.clientInfo.contactPerson}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Industry:</span>
                <span className="ml-2 text-gray-800">{state.clientInfo.industry}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Size:</span>
                <span className="ml-2 text-gray-800">{state.clientInfo.companySize}</span>
              </div>
            </div>
          </div>

          {/* Selected Services */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Selected Services</h3>
            <div className="space-y-3">
              {state.selectedServices.map(serviceId => (
                <div key={serviceId} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <SafeIcon icon={FiCheckCircle} className="text-blue-500" />
                  <span className="text-gray-800">{selectedServiceNames[serviceId]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <SafeIcon icon={FiDollarSign} className="mr-2" />
              Pricing Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monthly Service Fee:</span>
                <span className="text-2xl font-bold text-gray-800">${contractData.monthlyFee}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">One-time Setup Fee:</span>
                <span className="text-xl font-semibold text-gray-800">${contractData.setupFee}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">First Month Total:</span>
                  <span className="text-3xl font-bold text-blue-600">
                    ${contractData.monthlyFee + contractData.setupFee}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Level Agreement */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Level Agreement</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <SafeIcon icon={FiShield} className="text-2xl text-blue-500 mx-auto mb-2" />
                <div className="font-semibold text-gray-800">{contractData.serviceLevel}</div>
                <div className="text-sm text-gray-600">Service Tier</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <SafeIcon icon={FiClock} className="text-2xl text-green-500 mx-auto mb-2" />
                <div className="font-semibold text-gray-800">{contractData.supportHours}</div>
                <div className="text-sm text-gray-600">Support Hours</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <SafeIcon icon={FiArrowRight} className="text-2xl text-orange-500 mx-auto mb-2" />
                <div className="font-semibold text-gray-800">{contractData.responseTime}</div>
                <div className="text-sm text-gray-600">Response Time</div>
              </div>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="border-t pt-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  I agree to the terms and conditions of this service agreement, including:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Monthly billing cycle beginning on service activation</li>
                  <li>30-day notice required for service changes or cancellation</li>
                  <li>Service level agreement as outlined above</li>
                  <li>Data backup and security protocols</li>
                </ul>
              </div>
            </label>
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
            disabled={!agreed}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span>Accept & Continue</span>
            <SafeIcon icon={FiArrowRight} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default ContractReview;