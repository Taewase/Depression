const ML_API_URL = 'http://localhost:5000/api/predict'; // Point to backend server

export const calculateRiskLevel = async (answers) => {
  try {
    console.log('Starting risk level calculation with answers:', answers);
    
    // Convert answers object to array in the correct order
    const answersArray = Object.keys(answers)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(key => answers[key]);
    
    console.log('Converted answers array:', answersArray);
    
    const response = await fetch(ML_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: answersArray }) // Send array, not object
    });
    
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error response:', errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('API Response data:', result);
    
    // Extract final_class and confidence from the new response format
    const { final_class, confidence } = result;
    
    if (!final_class) {
      console.warn('No final_class found in response, using fallback');
      throw new Error('Invalid response format from ML service');
    }
    
    console.log('Final class:', final_class, 'Confidence:', confidence);
    
    // Map the 4 depression classes to our binary format
    // "Severe Depression", "Moderate Depression", "Mild Depression", "No Depression"
    if (final_class === "Severe Depression" || final_class === "Moderate Depression") {
      return "depressed";
    } else if (final_class === "Mild Depression" || final_class === "No Depression") {
      return "notDepressed";
    } else {
      console.warn('Unknown final_class:', final_class);
      // Fallback to simple scoring
      const score = Object.values(answers).reduce((sum, val) => sum + val, 0);
      if (score <= 7) return 'notDepressed';
      if (score <= 13) return 'depressed';
      return 'depressed';
    }
    
  } catch (error) {
    console.error('Error getting prediction:', error);
    
    // Enhanced fallback scoring with better logic
    const score = Object.values(answers).reduce((sum, val) => sum + val, 0);
    console.log('Fallback score calculation:', score);
    
    // More nuanced fallback based on score ranges
    if (score <= 7) {
      console.log('Fallback: Low score, returning notDepressed');
      return 'notDepressed';
    } else if (score <= 13) {
      console.log('Fallback: Moderate score, returning depressed');
      return 'depressed';
    } else {
      console.log('Fallback: High score, returning depressed');
      return 'depressed';
    }
  }
};

// New function to get detailed prediction results
export const getDetailedPrediction = async (answers) => {
  try {
    console.log('Getting detailed prediction with answers:', answers);
    
    // Convert answers object to array in the correct order
    const answersArray = Object.keys(answers)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(key => answers[key]);
    
    const response = await fetch(ML_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: answersArray })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error response:', errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Detailed API Response:', result);
    
    // Return only final_class and confidence as requested
    return {
      final_class: result.final_class,
      confidence: result.confidence
    };
    
  } catch (error) {
    console.error('Error getting detailed prediction:', error);
    throw error;
  }
}; 