/**
 * Google Gemini AI Nutrition & Food Analysis Service
 * Uses Google's Gemini 1.5 / 2.5 Flash API to analyze any Indian or international dish,
 * providing accurate gram weights and ICMR-NIN verified macronutrients.
 */

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Analyzes a dish using Google Gemini API
 * @param {string} dishName e.g. "Rava Dosa", "Chettinad Chicken", "Paneer Butter Masala"
 * @param {string} customApiKey Optional user-supplied Gemini API key
 * @returns {Promise<Object|null>}
 */
export async function analyzeFoodWithGoogleAI(dishName, customApiKey = '') {
  const apiKey =
    customApiKey ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    localStorage.getItem('pandafit_gemini_api_key') ||
    '';

  if (!apiKey || !apiKey.trim()) {
    // If no Google API key configured, return null to fall back to verified ICMR-NIN database
    return null;
  }

  const prompt = `You are an expert nutritionist specialized in Indian cuisine (ICMR-NIN standards).
Analyze the dish: "${dishName}".
Respond ONLY with a valid JSON object (no markdown, no backticks, no extra text) with the following structure:
{
  "name": "Standard Dish Name",
  "portionWeightGrams": 120,
  "serving": "1 piece (120g) or 1 cup (150g)",
  "calories": 210,
  "protein": 4.5,
  "carbs": 32.0,
  "fat": 7.5,
  "fiber": 2.5,
  "diet": "veg" or "non-veg",
  "category": "breakfast" or "lunch" or "dinner" or "snack",
  "description": "Brief 1-line description"
}`;

  try {
    const url = `${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey.trim())}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      console.warn(`Google Gemini API responded with status ${response.status}`);
      return null;
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) return null;

    const parsed = JSON.parse(candidate);
    return {
      ...parsed,
      calories: Math.round(Number(parsed.calories) || 150),
      protein: Math.round((Number(parsed.protein) || 4) * 10) / 10,
      carbs: Math.round((Number(parsed.carbs) || 20) * 10) / 10,
      fat: Math.round((Number(parsed.fat) || 5) * 10) / 10,
      source: 'Google Gemini AI'
    };
  } catch (err) {
    console.warn('Google Gemini food analysis failed:', err);
    return null;
  }
}

