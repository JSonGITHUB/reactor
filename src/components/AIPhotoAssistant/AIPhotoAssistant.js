import React from 'react';
import ShootingContextForm from './ShootingContextForm';
import AIRecommendationPanel from './AIRecommendationPanel';
import RecommendationHistory from './RecommendationHistory';

import { useAIPhotoAssistant } from '../../hooks/useAIPhotoAssistant';


function AIPhotoAssistant() {
  const {
    recommendations,
    loading,
    generateRecommendations,
    pending
  } = useAIPhotoAssistant();

  return (
    <div className="ai-photo-assistant">
      <ShootingContextForm onSubmit={generateRecommendations} />
      <AIRecommendationPanel
        recommendations={recommendations}
        loading={loading}
        pending={pending}
      />
      <RecommendationHistory />
    </div>
  );
}

export default AIPhotoAssistant;