export async function fetchAIRecommendations(prompt) {
  // Use Netlify function in production, local proxy in development
  const isProd = process.env.NODE_ENV === 'production';
  const apiUrl = isProd
    ? 'https://jazzy-dango-dd81f4.netlify.app/.netlify/functions/ai-recommendations'
    : '/api/ai/recommendations';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prompt)
  });

  if (!response.ok) {
    throw new Error('AI request failed');
  }

  return response.json();
}