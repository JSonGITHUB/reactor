import { useState } from 'react';

import { buildPhotographyPrompt }
  from '../ai/buildPhotographyPrompt';

import { fetchAIRecommendations }
  from '../services/aiService';

export function useAIPhotoAssistant() {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  // Track if a request is in progress
  const [pending, setPending] = useState(false);

  const generateRecommendations = async (context) => {
    setLoading(true);
    setPending(true);
    try {
      const prompt = buildPhotographyPrompt(context);
      const result = await fetchAIRecommendations(prompt);
      setRecommendations(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setPending(false), 200); // Small delay to avoid flicker
    }
  };

  return {
    recommendations,
    loading,
    generateRecommendations,
    pending
  };
}