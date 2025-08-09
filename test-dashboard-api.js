// Test script to verify dashboard API endpoint
const fetch = require('node-fetch');

async function testDashboardAPI() {
  try {
    console.log('Testing dashboard API endpoint...');
    
    // First, let's test if the server is running
    const response = await fetch('https://depression-41o5.onrender.com/api/dashboard/stats', {
      headers: {
        'Authorization': 'Bearer test-token', // You'll need a valid token
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Dashboard data received:');
      console.log('Stats:', data.stats);
      console.log('Risk Level Distribution:', data.riskLevelDistribution);
      console.log('Assessment Trends:', data.assessmentTrends);
      console.log('Demographics:', data.demographics);
    } else {
      console.log('Error response:', await response.text());
    }
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testDashboardAPI();
