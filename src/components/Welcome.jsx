import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight, FiCheckCircle, FiClock, FiAward } = FiIcons;

function Welcome() {
  const benefits = [
    {
      icon: FiCheckCircle,
      title: "Streamlined Process",
      description: "Quick and efficient onboarding in just 6 simple steps"
    },
    {
      icon: FiClock,
      title: "Fast Setup",
      description: "Get your IT infrastructure up and running in no time"
    },
    {
      icon: FiAward,
      title: "Expert Support",
      description: "Dedicated team of certified IT professionals"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Welcome to Your IT Journey
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Let's get you set up with professional IT services tailored to your business needs. 
          Our comprehensive onboarding process ensures a smooth transition to better technology.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid md:grid-cols-3 gap-8 mb-12"
      >
        {benefits.map((benefit, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={benefit.icon} className="text-white text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{benefit.title}</h3>
            <p className="text-gray-600">{benefit.description}</p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-2xl p-8 shadow-xl"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 mb-6">
          The onboarding process takes about 15-20 minutes and will help us understand 
          your specific IT needs and requirements.
        </p>
        <Link
          to="/onboarding"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <span>Start Onboarding</span>
          <SafeIcon icon={FiArrowRight} className="text-xl" />
        </Link>
      </motion.div>
    </div>
  );
}

export default Welcome;