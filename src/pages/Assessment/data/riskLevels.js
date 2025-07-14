export const riskLevelData = {
  depressed: {
    level: "Depression Detected",
    message: "Your responses indicate symptoms consistent with depression. We strongly recommend seeking professional help for proper evaluation and support.",
    recommendations: [
      "Contact a mental health professional immediately",
      "Reach out to your doctor or a mental health crisis line",
      "Connect with emergency mental health services if needed",
      "Consider immediate professional support through our partner platforms",
      "Don't hesitate to reach out to trusted friends or family"
    ],
    severity: "high"
  },
  notDepressed: {
    level: "No Depression Detected",
    message: "Your responses do not indicate significant symptoms of depression. Continue monitoring your mental health and maintain healthy habits.",
    recommendations: [
      "Continue practicing self-care and healthy lifestyle habits",
      "Stay connected with supportive friends and family",
      "Engage in regular physical activity and mindfulness",
      "Schedule regular mental health check-ins with yourself",
      "Consider periodic mental health screenings"
    ],
    severity: "low"
  }
}; 