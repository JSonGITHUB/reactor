import React from 'react';


function AIRecommendationPanel({ recommendations, loading, pending }) {
  // Show loading overlay but keep last recommendations visible
  return (
    <div className="recommendation-panel color-yellow contentLeft" style={{ position: 'relative', minHeight: 180 }}>
      {recommendations && (
        <div>
          <h2 className='containerDetail p-20 m-10'>
            Recommended Settings
          </h2>
          <div className='pl-30 pr-30'>
            📊 ISO:
            <div className='color-lite mb-5'>
              {recommendations.iso}
            </div>
            ⏱️ Shutter: 
            <div className='color-lite mb-5'>
              {recommendations.shutterSpeed}
            </div>
            ☀️ Aperture: 
            <div className='color-lite mb-15'>
              {recommendations.aperture}
            </div>
            🗒️ {recommendations.explanation}
            <ul className='color-lite'>
              {Array.isArray(recommendations.tips) && recommendations.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {!recommendations && !loading && (
        <div className="color-lite">No recommendations yet.</div>
      )}
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255,255,255,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2
        }}>
          <span>Generating recommendations...</span>
        </div>
      )}
    </div>
  );
}

export default AIRecommendationPanel;