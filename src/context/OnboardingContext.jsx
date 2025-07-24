import React, { createContext, useContext, useReducer } from 'react';

const OnboardingContext = createContext();

const initialState = {
  currentStep: 1,
  totalSteps: 6,
  clientInfo: {
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    industry: '',
    companySize: '',
    currentProvider: '',
    budget: '',
    urgency: ''
  },
  selectedServices: [],
  technicalAssessment: {
    currentInfrastructure: '',
    operatingSystem: '',
    networkSize: '',
    securityConcerns: '',
    complianceRequirements: '',
    backupSolution: '',
    cloudServices: []
  },
  timeline: {
    preferredStartDate: '',
    projectDuration: '',
    criticalDeadlines: '',
    availabilityWindows: ''
  },
  contractDetails: {
    serviceLevel: '',
    supportHours: '',
    responseTime: '',
    monthlyFee: 0,
    setupFee: 0
  }
};

function onboardingReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_CLIENT_INFO':
      return {
        ...state,
        clientInfo: { ...state.clientInfo, ...action.payload }
      };
    case 'UPDATE_SERVICES':
      return {
        ...state,
        selectedServices: action.payload
      };
    case 'UPDATE_ASSESSMENT':
      return {
        ...state,
        technicalAssessment: { ...state.technicalAssessment, ...action.payload }
      };
    case 'UPDATE_TIMELINE':
      return {
        ...state,
        timeline: { ...state.timeline, ...action.payload }
      };
    case 'UPDATE_CONTRACT':
      return {
        ...state,
        contractDetails: { ...state.contractDetails, ...action.payload }
      };
    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.totalSteps)
      };
    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1)
      };
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload
      };
    default:
      return state;
  }
}

export function OnboardingProvider({ children }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  return (
    <OnboardingContext.Provider value={{ state, dispatch }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}