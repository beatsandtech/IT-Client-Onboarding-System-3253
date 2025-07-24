import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOnboarding } from '../context/OnboardingContext';
import ProgressBar from './ProgressBar';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiArrowRight, FiArrowLeft, FiCalendar, FiClock } = FiIcons;

function ProjectTimeline() {
  const { state, dispatch } = useOnboarding();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(state.timeline);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContinue = () => {
    dispatch({ type: 'UPDATE_TIMELINE', payload: formData });
    dispatch({ type: 'SET_STEP', payload: 5 });
    navigate('/contract');
  };

  const handleBack = () => {
    dispatch({ type: 'SET_STEP', payload: 3 });
    navigate('/assessment');
  };

  const projectDurations = [
    '1-2 weeks', '3-4 weeks', '1-2 months', '3-6 months', '6+ months'
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <ProgressBar currentStep={4} totalSteps={6} />
      
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Project Timeline</h2>
          <p className="text-gray-600">Let's plan your IT implementation schedule</p>
        </div>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiCalendar} className="inline mr-2" />
                Preferred Start Date
              </label>
              <input
                type="date"
                name="preferredStartDate"
                value={formData.preferredStartDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <SafeIcon icon={FiClock} className="inline mr-2" />
                Expected Project Duration
              </label>
              <select
                name="projectDuration"
                value={formData.projectDuration}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select duration</option>
                {projectDurations.map(duration => (
                  <option key={duration} value={duration}>{duration}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Critical Deadlines or Events
            </label>
            <textarea
              name="criticalDeadlines"
              value={formData.criticalDeadlines}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Any important deadlines, events, or milestones we should be aware of?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Availability Windows
            </label>
            <textarea
              name="availabilityWindows"
              value={formData.availabilityWindows}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="When are you available for installations, migrations, or maintenance? (e.g., weekends, after hours, specific days)"
            />
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">Implementation Process</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                <span className="text-blue-700">Initial consultation and planning</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                <span className="text-blue-700">Infrastructure assessment and preparation</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                <span className="text-blue-700">Implementation and configuration</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">4</div>
                <span className="text-blue-700">Testing and user training</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">5</div>
                <span className="text-blue-700">Go-live and ongoing support</span>
              </div>
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

export default ProjectTimeline;