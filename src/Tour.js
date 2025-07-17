import React, { useEffect, useState } from 'react';
import { useTour } from './TourContext';

export default function Tour() {
  const { isTourActive, currentStep, steps, nextStep, stopTour } = useTour();
  const [highlightStyle, setHighlightStyle] = useState({});
  const [tooltipStyle, setTooltipStyle] = useState({});

  useEffect(() => {
    if (!isTourActive) return;

    const step = steps[currentStep];
    const targetElement = document.querySelector(step.selector);

    // Clean up previous highlights
    document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));

    if (targetElement) {
      targetElement.classList.add('tour-highlight');
      const rect = targetElement.getBoundingClientRect();

      // Position the highlight box over the element
      setHighlightStyle({
        width: `${rect.width + 12}px`,
        height: `${rect.height + 12}px`,
        top: `${rect.top - 6}px`,
        left: `${rect.left - 6}px`,
      });

      // Position the tooltip near the element
      setTooltipStyle({
        top: `${rect.bottom + 15}px`,
        left: `${rect.left}px`,
      });
    }

    // Cleanup function to remove class when component unmounts or step changes
    return () => {
      if (targetElement) {
        targetElement.classList.remove('tour-highlight');
      }
    };
  }, [isTourActive, currentStep, steps]);

  if (!isTourActive) return null;

  return (
    <>
      <div className="tour-overlay" onClick={stopTour}></div>
      <div className="tour-highlight-box" style={highlightStyle}></div>
      <div className="tour-tooltip" style={tooltipStyle}>
        <p>{steps[currentStep].content}</p>
        <div className="tour-footer">
          <span>{currentStep + 1} / {steps.length}</span>
          <div>
            <button className="tour-button skip" onClick={stopTour}>Skip</button>
            <button className="tour-button" onClick={nextStep}>
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}