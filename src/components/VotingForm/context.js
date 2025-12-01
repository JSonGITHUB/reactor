// src/components/VotingForm/context.js
import React, { createContext, useContext } from 'react';

export const VotingFormContext = createContext(null);

export const useVotingFormContext = () => {
    const ctx = useContext(VotingFormContext);
    if (!ctx) throw new Error('useVotingFormContext must be used within VotingFormContext.Provider');
    return ctx;
};