import React, { createContext, useState, useContext } from 'react';

// The tourSteps array remains unchanged.
const tourSteps = [
  {
    selector: '.search-bar',
    content: 'Start by searching for any room, branch, or status like "vacant" or "locked". You can combine terms!',
  },
  {
    selector: '.room-card',
    content: 'This is a Room Card. It shows a quick summary of the classroom\'s status.',
  },
  {
    selector: '.occupancy-controls',
    content: 'If you are a Teacher or Admin, you can change the room occupancy here to keep the data live.',
  },
  {
    selector: '.light-controls .toggle-switch',
    content: 'You can also toggle the lights on or off with this switch.',
  },
  {
    selector: '.nav-links a[href="/analytics"]',
    content: 'Click here to see the Analytics page for campus-wide insights.',
  },
  {
    selector: '.theme-toggle',
    content: 'Finally, you can switch between light and dark themes anytime.',
  }
];

const TourContext = createContext(null);

export const TourProvider = ({ children }) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // This function is now exposed to be called manually
  const startTour = () => {
    const hasCompletedTour = localStorage.getItem('edusenseTourCompleted');
    if (!hasCompletedTour) {
      setCurrentStep(0);
      setIsTourActive(true);
    }
  };

  const stopTour = () => {
    localStorage.setItem('edusenseTourCompleted', 'true');
    setIsTourActive(false);
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      stopTour(); // End of tour
    }
  };

  // This is the object that child components will receive.
  // It MUST include startTour.
  const value = {
    isTourActive,
    currentStep,
    steps: tourSteps,
    startTour, // <-- This makes the function available
    stopTour,
    nextStep,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => useContext(TourContext);