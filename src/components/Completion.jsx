import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOnboarding } from '../context/OnboardingContext';
import { useAuth } from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheckCircle, FiCalendar, FiMail, FiPhone, FiArrowRight } = FiIcons;

function Completion() {
  const { state } = useOnboarding();
  const { saveOnboardingData } = useAuth();

  useEffect(() => {
    // Save onboarding data to Supabase when component mounts
    const saveData = async () => {
      const result = await saveOnboardingData(state);
      if (result.error) {
        console.error('Failed to save onboarding data:', result.error);
      }
    };
    
    saveData();
  }, [state, saveOnboardingData]);

  const nextSteps = [
    {
      icon: FiCalendar,
      title: "Schedule Kick-off Meeting",
      description: "We'll contact you within 24 hours to schedule your project kick-off",
      timeline: "Within 24 hours"
    },
    {
      icon: FiMail,
      title: "Welcome Package",
      description: "Receive detailed project plan and account setup information",
      timeline: "Within 48 hours"
    },
    {
      icon: FiPhone,
      title: "Technical Assessment",
      description: "Our team will conduct an on-site or remote technical assessment",
      timeline: "Week 1"
    }
  ];

  return (
    <div className="max-w-3xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-xl p-8 mb-8"
      >
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <SafeIcon icon={FiCheckCircle} className="text-white text-4xl" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to TechSolutions Pro!
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Congratulations, {state.clientInfo.contactPerson}! Your onboarding is complete.
          </p>
          <p className="text-gray-600">
            We're excited to partner with {state.clientInfo.companyName} and help transform your IT infrastructure.
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Service Summary</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Monthly Investment</h3>
              <p className="text-3xl font-bold text-blue-600">${state.contractDetails.monthlyFee}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Services Selected</h3>
              <p className="text-2xl font-bold text-gray-800">{state.selectedServices.length} Services</p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-2xl shadow-xl p-8 mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">What Happens Next?</h2>
        <div className="space-y-6">
          {nextSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              className="flex items-start space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="bg-blue-100 p-3 rounded-lg">
                <SafeIcon icon={step.icon} className="text-blue-600 text-xl" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-800 mb-1">{step.title}</h3>
                <p className="text-gray-600 mb-2">{step.description}</p>
                <span className="text-sm text-blue-600 font-medium">{step.timeline}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="bg-gray-50 rounded-xl p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Need Immediate Assistance?</h3>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:support@techsolutionspro.com"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            <SafeIcon icon={FiMail} />
            <span>support@techsolutionspro.com</span>
          </a>
          <a
            href="tel:+1-555-123-4567"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            <SafeIcon icon={FiPhone} />
            <span>(555) 123-4567</span>
          </a>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="mt-8"
      >
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
        >
          <span>View Client Dashboard</span>
          <SafeIcon icon={FiArrowRight} />
        </Link>
      </motion.div>
    </div>
  );
}

export default Completion;