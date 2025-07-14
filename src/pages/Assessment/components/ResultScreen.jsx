import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, RefreshCcw, Loader, Activity } from 'lucide-react';

const ResultScreen = ({ score, riskLevel, loading, error, onReset, detailedResult }) => {
  const getRiskLevelDetails = (level, finalClass, confidence) => {
    // Handle the new 4-class depression system
    if (finalClass) {
      switch (finalClass) {
        case 'Severe Depression':
          return {
            title: 'Severe Depression Detected',
            icon: <AlertTriangle className="w-12 h-12 text-red-600" />,
            description: 'Your responses indicate severe symptoms of depression. Immediate professional intervention is strongly recommended.',
            recommendations: [
              'Contact a mental health professional immediately',
              'Reach out to your doctor or a mental health crisis line',
              'Connect with emergency mental health services if needed',
              'Consider immediate professional support through our partner platforms',
              'Don\'t hesitate to reach out to trusted friends or family'
            ],
            className: 'bg-red-50 border-red-300 text-red-800',
            severity: 'severe',
            confidence: confidence
          };
        case 'Moderate Depression':
          return {
            title: 'Moderate Depression Detected',
            icon: <AlertTriangle className="w-12 h-12 text-orange-500" />,
            description: 'Your responses indicate moderate symptoms of depression. Professional help is recommended for proper evaluation and support.',
            recommendations: [
              'Contact a mental health professional for evaluation',
              'Reach out to your doctor or a mental health professional',
              'Consider therapy or counseling services',
              'Build stronger support networks with friends and family',
              'Practice self-care and stress management techniques'
            ],
            className: 'bg-orange-50 border-orange-300 text-orange-800',
            severity: 'moderate',
            confidence: confidence
          };
        case 'Mild Depression':
          return {
            title: 'Mild Depression Detected',
            icon: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
            description: 'Your responses indicate mild symptoms of depression. Consider seeking professional guidance and monitoring your mental health.',
            recommendations: [
              'Consider consulting with a mental health professional',
              'Practice regular self-care and stress management',
              'Stay connected with supportive friends and family',
              'Engage in regular physical activity and mindfulness',
              'Monitor your mental health and seek help if symptoms worsen'
            ],
            className: 'bg-yellow-50 border-yellow-300 text-yellow-800',
            severity: 'mild',
            confidence: confidence
          };
        case 'No Depression':
          return {
            title: 'No Depression Detected',
            icon: <CheckCircle className="w-12 h-12 text-green-500" />,
            description: 'Your responses do not indicate significant symptoms of depression. Continue monitoring your mental health and maintain healthy habits.',
            recommendations: [
              'Continue practicing self-care and healthy lifestyle habits',
              'Stay connected with supportive friends and family',
              'Engage in regular physical activity and mindfulness',
              'Schedule regular mental health check-ins with yourself',
              'Consider periodic mental health screenings'
            ],
            className: 'bg-green-50 border-green-300 text-green-800',
            severity: 'none',
            confidence: confidence
          };
        default:
          return null;
      }
    }
    
    // Fallback to binary system for backward compatibility
    switch (level) {
      case 'depressed':
        return {
          title: 'Depression Detected',
          icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
          description: 'Your responses indicate symptoms consistent with depression. We strongly recommend seeking professional help for proper evaluation and support.',
          recommendations: [
            'Contact a mental health professional immediately',
            'Reach out to your doctor or a mental health crisis line',
            'Connect with emergency mental health services if needed',
            'Consider immediate professional support through our partner platforms',
            'Don\'t hesitate to reach out to trusted friends or family'
          ],
          className: 'bg-red-50 border-red-200 text-red-700'
        };
      case 'notDepressed':
        return {
          title: 'No Depression Detected',
          icon: <CheckCircle className="w-12 h-12 text-green-500" />,
          description: 'Your responses do not indicate significant symptoms of depression. Continue monitoring your mental health and maintain healthy habits.',
          recommendations: [
            'Continue practicing self-care and healthy lifestyle habits',
            'Stay connected with supportive friends and family',
            'Engage in regular physical activity and mindfulness',
            'Schedule regular mental health check-ins with yourself',
            'Consider periodic mental health screenings'
          ],
          className: 'bg-green-50 border-green-200 text-green-700'
        };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader className="w-12 h-12 animate-spin mx-auto text-blue-500" />
        <h3 className="mt-4 text-xl font-semibold">Analyzing your responses...</h3>
        <p className="mt-2 text-gray-600">Please wait while our ML model processes your assessment.</p>
      </div>
    );
  }

  // Extract final_class and confidence from detailedResult if available
  const finalClass = detailedResult?.final_class;
  const confidence = detailedResult?.confidence;
  
  const details = getRiskLevelDetails(riskLevel, finalClass, confidence);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className={`p-6 rounded-lg border ${details?.className || 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center justify-center mb-4">
          {details?.icon}
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-4">{details?.title || 'Assessment Complete'}</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            <p>{error}</p>
          </div>
        )}
        
        <p className="text-center mb-6">{details?.description}</p>
        
        {/* Display confidence score if available */}
        {confidence && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Model Confidence</span>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-blue-600">
                {Math.round(confidence * 100)}%
              </span>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Recommendations:</h3>
          <ul className="list-disc pl-5 space-y-2">
            {details?.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCcw className="w-5 h-5" />
          Take Assessment Again
        </button>
      </div>
    </motion.div>
  );
};

export default ResultScreen; 