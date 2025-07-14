import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Brain, Users, Shield, Clock, BookOpen, Sparkles, Star, Zap, AlertTriangle, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calculateRiskLevel, getDetailedPrediction } from './Assessment/utils/assessment';

const Assessment = () => {
  const { isAuthenticated, addAssessmentResult } = useAuth();
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [riskLevel, setRiskLevel] = useState(null);
  const [detailedResult, setDetailedResult] = useState(null);

  const questions = [
    "Do you often have headaches?",
    "Is your appetite poor?",
    "Do you sleep badly?",
    "Are you easily frightened?",
    "Do your hands shake?",
    "Do you feel nervous, tense, or worried?",
    "Is your digestion poor?",
    "Do you have trouble thinking clearly?",
    "Do you feel unhappy?",
    "Do you cry more than usual?",
    "Do you find it difficult to enjoy your daily activities?",
    "Do you find it difficult to make decisions?",
    "Is your daily work suffering?",
    "Are you unable to play a useful part in life?",
    "Have you lost interest in things?",
    "Do you feel that you are a worthless person?",
    "Has the thought of ending your life been on your mind?",
    "Do you feel tired all the time?",
    "Do you have uncomfortable feelings in your stomach?",
    "Are you easily tired?"
  ];

  const handleRadioChange = (questionIdx, value) => {
    setAnswers((prev) => ({ ...prev, [questionIdx]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
      setScore(totalScore);
      
      // Get detailed prediction for new 4-class system
      const detailedPrediction = await getDetailedPrediction(answers);
      setDetailedResult(detailedPrediction);
      
      // Also get binary risk level for compatibility
      const predictedRiskLevel = await calculateRiskLevel(answers);
      setRiskLevel(predictedRiskLevel);
      setError(null);
      
      if (isAuthenticated) {
        const result = getResultMessage(predictedRiskLevel);
        addAssessmentResult({
          score: totalScore,
          level: result.level,
          recommendations: result.recommendations
        });
      }
    } catch (err) {
      setError('Failed to get prediction. Using basic scoring instead.');
      const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
      setScore(totalScore);
      const fallbackLevel = totalScore <= 7 ? 'notDepressed' : totalScore <= 13 ? 'depressed' : 'depressed';
      setRiskLevel(fallbackLevel);
    } finally {
      setLoading(false);
      setShowResults(true);
    }
  };

  const resetAssessment = () => {
    setAnswers({});
    setShowResults(false);
    setScore(0);
    setLoading(false);
    setError(null);
    setRiskLevel(null);
    setDetailedResult(null);
  };

  const getResultMessage = (assessmentLevel = riskLevel) => {
    // Use detailedResult if available for the new 4-class system
    if (detailedResult?.final_class) {
      const { final_class, confidence } = detailedResult;
      
      switch (final_class) {
        case 'Severe Depression':
          return {
            level: "Severe Depression Detected",
            color: "red",
            icon: <AlertTriangle className="h-8 w-8" />,
            message: "Your responses indicate severe symptoms of depression. Immediate professional intervention is strongly recommended.",
            recommendations: [
              "Contact a mental health professional immediately",
              "Reach out to your doctor or a mental health crisis line",
              "Connect with emergency mental health services if needed",
              "Consider immediate professional support through our partner platforms",
              "Don't hesitate to reach out to trusted friends or family"
            ],
            confidence: confidence
          };
        case 'Moderate Depression':
          return {
            level: "Moderate Depression Detected",
            color: "amber",
            icon: <AlertTriangle className="h-8 w-8" />,
            message: "Your responses indicate moderate symptoms of depression. Professional help is recommended for proper evaluation and support.",
            recommendations: [
              "Contact a mental health professional for evaluation",
              "Reach out to your doctor or a mental health professional",
              "Consider therapy or counseling services",
              "Build stronger support networks with friends and family",
              "Practice self-care and stress management techniques"
            ],
            confidence: confidence
          };
        case 'Mild Depression':
          return {
            level: "Mild Depression Detected",
            color: "amber",
            icon: <AlertTriangle className="h-8 w-8" />,
            message: "Your responses indicate mild symptoms of depression. Consider seeking professional guidance and monitoring your mental health.",
            recommendations: [
              "Consider consulting with a mental health professional",
              "Practice regular self-care and stress management",
              "Stay connected with supportive friends and family",
              "Engage in regular physical activity and mindfulness",
              "Monitor your mental health and seek help if symptoms worsen"
            ],
            confidence: confidence
          };
        case 'No Depression':
          return {
            level: "No Depression Detected",
            color: "indigo",
            icon: <Star className="h-8 w-8" />,
            message: "Your responses do not indicate significant symptoms of depression. Continue monitoring your mental health and maintain healthy habits.",
            recommendations: [
              "Continue practicing self-care and healthy lifestyle habits",
              "Stay connected with supportive friends and family",
              "Engage in regular physical activity and mindfulness",
              "Schedule regular mental health check-ins with yourself",
              "Consider periodic mental health screenings"
            ],
            confidence: confidence
          };
        default:
          break;
      }
    }
    
    // Fallback to binary system for backward compatibility
    if (assessmentLevel === 'depressed') {
      return {
        level: "Depression Detected",
        color: "red",
        icon: <AlertTriangle className="h-8 w-8" />,
        message: "Your responses indicate symptoms consistent with depression. We strongly recommend seeking professional help for proper evaluation and support.",
        recommendations: [
          "Contact a mental health professional immediately",
          "Reach out to your doctor or a mental health crisis line",
          "Connect with emergency mental health services if needed",
          "Consider immediate professional support through our partner platforms",
          "Don't hesitate to reach out to trusted friends or family"
        ]
      };
    } else {
      return {
        level: "No Depression Detected",
        color: "indigo",
        icon: <Star className="h-8 w-8" />,
        message: "Your responses do not indicate significant symptoms of depression. Continue monitoring your mental health and maintain healthy habits.",
        recommendations: [
          "Continue practicing self-care and healthy lifestyle habits",
          "Stay connected with supportive friends and family",
          "Engage in regular physical activity and mindfulness",
          "Schedule regular mental health check-ins with yourself",
          "Consider periodic mental health screenings"
        ]
      };
    }
  };

  if (showResults) {
    const result = getResultMessage();
    const colorClasses = {
      indigo: { 
        bg: "from-indigo-500 to-blue-500", 
        border: "border-indigo-300 dark:border-indigo-600", 
        text: "text-indigo-800 dark:text-indigo-200",
        accent: "bg-indigo-100 dark:bg-indigo-900"
      },
      amber: { 
        bg: "from-amber-400 to-orange-500", 
        border: "border-amber-300 dark:border-amber-600", 
        text: "text-amber-800 dark:text-amber-200",
        accent: "bg-amber-100 dark:bg-amber-900"
      },
      red: { 
        bg: "from-red-500 to-rose-500", 
        border: "border-red-300 dark:border-red-600", 
        text: "text-red-800 dark:text-red-200",
        accent: "bg-red-100 dark:bg-red-900"
      }
    };

    return (
      isAuthenticated ? (
        // Compact results for authenticated users in dashboard
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
            <div className={`p-6 md:p-8 text-center border-b ${colorClasses[result.color].border}`}>
              <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${colorClasses[result.color].bg} flex items-center justify-center mb-4 shadow-lg`}>
                <div className="text-white">
                  {result.icon}
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                Assessment Complete
              </h2>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${colorClasses[result.color].bg} text-white font-semibold text-base`}>
                <Sparkles className="h-4 w-4" />
                {result.level}
              </div>
            </div>
            
            <div className="p-6 md:p-8 space-y-6">
              <div className="text-center">
                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
                  {result.message}
                </p>
                {result.confidence && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-blue-800 text-sm">Model Confidence</span>
                    </div>
                    <div className="text-center">
                      <span className="text-xl font-bold text-blue-600">
                        {Math.round(result.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-indigo-500" />
                  Your Recommended Next Steps
                </h3>
                <div className="grid gap-3">
                  {result.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                      <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white font-bold text-xs">{index + 1}</span>
                      </div>
                      <span className="text-slate-700 dark:text-slate-200 leading-relaxed text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    This assessment is a screening tool, not a diagnosis. Please consult with a healthcare professional for comprehensive advice.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={resetAssessment}
                    className="group px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      Retake Assessment
                    </span>
                  </button>
                  <button 
                    className="group px-6 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-500 rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-500 transition-all duration-300 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Find Support
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Full-screen results for non-authenticated users
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
              <div className={`p-8 md:p-12 text-center border-b ${colorClasses[result.color].border}`}>
                <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${colorClasses[result.color].bg} flex items-center justify-center mb-6 shadow-lg`}>
                  <div className="text-white">
                    {result.icon}
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                  Assessment Complete
                </h2>
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${colorClasses[result.color].bg} text-white font-semibold text-lg`}>
                  <Sparkles className="h-5 w-5" />
                  {result.level}
                </div>
              </div>
              
              <div className="p-8 md:p-12 space-y-8">
                <div className="text-center">
                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
                    {result.message}
                  </p>
                  {result.confidence && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-blue-800">Model Confidence</span>
                      </div>
                      <div className="text-center">
                        <span className="text-2xl font-bold text-blue-600">
                          {Math.round(result.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-3">
                    <CheckCircle className="h-7 w-7 text-indigo-500" />
                    Your Recommended Next Steps
                  </h3>
                  <div className="grid gap-4">
                    {result.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <span className="text-slate-700 dark:text-slate-200 leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-center space-y-6">
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                      This assessment is a screening tool, not a diagnosis. Please consult with a healthcare professional for comprehensive advice.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={resetAssessment}
                      className="group px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      <span className="flex items-center gap-2">
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        Retake Assessment
                      </span>
                    </button>
                    <button 
                      className="group px-8 py-3 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-500 rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-500 transition-all duration-300"
                    >
                      <span className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Find Support
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    );
  }

  // New: Render all questions at once
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-8 px-4 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="max-w-2xl w-full mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-primary-600 mb-6">Mental Health Questions</h2>
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 p-6 shadow-sm">
              <div className="flex items-center mb-3">
                <span className="font-bold text-primary-600 mr-2">{idx + 1}.</span>
                <span className="text-lg text-slate-800 dark:text-slate-100">{q}</span>
              </div>
              <div className="flex items-center gap-6 mt-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${idx}`}
                    value={1}
                    checked={answers[idx] === 1}
                    onChange={() => handleRadioChange(idx, 1)}
                    className="form-radio text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-slate-700 dark:text-slate-200">Yes</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${idx}`}
                    value={0}
                    checked={answers[idx] === 0}
                    onChange={() => handleRadioChange(idx, 0)}
                    className="form-radio text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-slate-700 dark:text-slate-200">No</span>
                </label>
              </div>
            </div>
          ))}
        </div>
        <button
          type="submit"
          disabled={Object.keys(answers).length !== questions.length || loading}
          className={`mt-8 w-full py-3 rounded-lg font-bold text-white transition-all duration-300 shadow-md ${Object.keys(answers).length !== questions.length || loading ? 'bg-primary-300 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
        {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
      </form>
    </div>
  );
};

export default Assessment;