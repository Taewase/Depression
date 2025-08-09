const ML_API_URL = 'https://fastapi-whd1.onrender.com/predict';

// This must exactly match your FastAPI FEATURES list order
const QUESTION_MAPPING = [
  'headache', 'appetite', 'sleep', 'fear', 'shaking',
  'nervous', 'digestion', 'troubled', 'unhappy', 'cry',
  'enjoyment', 'decisions', 'work', 'play', 'interest',
  'worthless', 'suicide', 'tiredness', 'uncomfortable', 'easily_tired'
];

/**
 * Transforms {0:1, 1:0} format to {headache:1, appetite:0}
 * @param {Object} answers - Original answers with numeric keys
 * @returns {Object} - Transformed answers with named keys
 */
const transformAnswers = (answers) => {
  return Object.keys(answers).reduce((result, key) => {
    const index = parseInt(key);
    if (!isNaN(index) && index < QUESTION_MAPPING.length) {
      result[QUESTION_MAPPING[index]] = answers[key];
    }
    return result;
  }, {});
};

/**
 * Calculates depression risk level
 * @param {Object} answers - User answers (0-1 for each question)
 * @returns {Promise<string>} - 'depressed' or 'notDepressed'
 */
export const calculateRiskLevel = async (answers) => {
  try {
    // Transform answers to API format
    const transformedAnswers = transformAnswers(answers);
    console.debug('Transformed answers:', transformedAnswers);

    // Call prediction API
    const response = await fetch(ML_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(transformedAnswers)
    });

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(`API request failed with status ${response.status}`);
    }

    // Process successful response
    const result = await response.json();
    console.debug('API Response:', result);

    // Determine risk level based on final_class
    switch (result.final_class) {
      case 'Severe Depression':
      case 'Moderate Depression':
        return 'depressed';
      case 'Mild Depression':
      case 'No Depression':
        return 'notDepressed';
      default:
        console.warn('Unknown final_class:', result.final_class);
        return calculateFallbackRisk(answers);
    }

  } catch (error) {
    console.error('Prediction error:', error);
    return calculateFallbackRisk(answers);
  }
};

/**
 * Gets detailed prediction results
 * @param {Object} answers - User answers (0-1 for each question)
 * @returns {Promise<Object>} - {final_class, confidence}
 */
export const getDetailedPrediction = async (answers) => {
  try {
    // Transform answers to API format
    const transformedAnswers = transformAnswers(answers);

    const response = await fetch(ML_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(transformedAnswers)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API request failed: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const result = await response.json();
    return {
      final_class: result.final_class,
      confidence: result.confidence
    };

  } catch (error) {
    console.error('Detailed prediction error:', error);
    throw error; // Re-throw for handling in calling component
  }
};

/**
 * Fallback calculation when API fails
 * @param {Object} answers - User answers
 * @returns {string} - Fallback risk determination
 */
const calculateFallbackRisk = (answers) => {
  const score = Object.values(answers).reduce((sum, val) => sum + (val || 0), 0);
  console.warn('Using fallback calculation with score:', score);
  
  // SRQ-20 scoring thresholds
  if (score <= 7) return 'notDepressed';
  if (score <= 13) return 'depressed'; // Moderate
  return 'depressed'; // High
};