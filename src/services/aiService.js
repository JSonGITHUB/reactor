export async function fetchAIRecommendations(prompt) {

  const isProd = process.env.NODE_ENV === 'production';
  const apiUrl = isProd
    ? 'https://keepfrothalive.netlify.app/netlify/functions/ai-recommendations'
    : '/api/ai/recommendations'; // local proxy

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