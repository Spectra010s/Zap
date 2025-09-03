import React, { createContext, useContext, useState } from 'react';

const VoiceControlContext = createContext();

export const VoiceControlProvider = ({ children }) => {
  const [showVoiceControl, setShowVoiceControl] = useState(false);

  const toggleVoiceControl = () => {
    setShowVoiceControl(prev => !prev);
  };

  return (
    <VoiceControlContext.Provider value={{ showVoiceControl, toggleVoiceControl }}>
      {children}
    </VoiceControlContext.Provider>
  );
};

export const useVoiceControl = () => {
  const context = useContext(VoiceControlContext);
  if (!context) {
    throw new Error('useVoiceControl must be used within a VoiceControlProvider');
  }
  return context;
};
