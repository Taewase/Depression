import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import QuestionScreen from './components/QuestionScreen';
import ResultScreen from './components/ResultScreen';
import { questions } from './data/questions';
import { calculateRiskLevel, getDetailedPrediction } from './utils/assessment';

const Assessment = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [riskLevel, setRiskLevel] = useState(null);
  const [detailedResult, setDetailedResult] = useState(null);

  const handleAnswer = async (answer) => {
    setDirection(1);
    const newAnswers = { ...answers, [currentQuestion]: answer };
    setAnswers(newAnswers);
    
    console.log(`Answered question ${currentQuestion + 1}:`, answer);
    console.log('Current answers:', newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      console.log('Last question answered! Triggering API call...');
      setLoading(true);
      try {
        console.log('Calling getDetailedPrediction with answers:', newAnswers);
        const detailedPrediction = await getDetailedPrediction(newAnswers);
        console.log('Received detailed prediction:', detailedPrediction);
        
        // Set detailed result for display
        setDetailedResult(detailedPrediction);
        
        // Also get binary risk level for compatibility
        const predictedRiskLevel = await calculateRiskLevel(newAnswers);
        console.log('Received risk level:', predictedRiskLevel);
        setRiskLevel(predictedRiskLevel);
        setError(null);
      } catch (err) {
        console.error('Prediction error:', err);
        setError('Failed to get prediction. Using basic scoring instead.');
      } finally {
        setLoading(false);
        setShowResults(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setDirection(-1);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1);
      }, 300);
    }
  };

  const resetAssessment = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
    setIsStarted(false);
    setDirection(0);
    setError(null);
    setRiskLevel(null);
    setDetailedResult(null);
  };

  const startAssessment = () => {
    setIsStarted(true);
  };

  // Pass additional props to ResultScreen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
            {!isStarted ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5" />
                  <div className="relative">
                    <div className="inline-flex items-center justify-center mb-8">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 rotate-6 absolute top-0 left-0 animate-pulse" />
                        <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center relative">
                          <Brain className="h-12 w-12 text-primary-500" />
                        </div>
                      </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient mb-6">
                      Mental Health Assessment
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                      Take our comprehensive mental health assessment to better understand your emotional well-being. Your responses are completely confidential.
                    </p>
                    <div className="space-y-6">
                      <button
                        onClick={startAssessment}
                        className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 font-medium text-lg group relative overflow-hidden"
                      >
                        <span className="relative z-10">Start Assessment</span>
                        <ArrowRight className="ml-2 h-5 w-5 relative z-10 transition-transform group-hover:translate-x-1" />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary-500" />
                          <span>5-10 minutes</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary-500" />
                          <span>20 Questions</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-primary-500" />
                          <span>Instant Results</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-gray-100">
                      <div className="flex items-start space-x-3 text-left max-w-lg mx-auto">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-6 w-6 text-accent-500" />
                        </div>
                        <p className="text-sm text-gray-500">
                          This assessment is a screening tool and not a diagnostic instrument. Please consult with a qualified mental health professional for proper evaluation and diagnosis.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
        ) : !showResults ? (
                <QuestionScreen
            question={questions[currentQuestion]}
                  currentQuestion={currentQuestion}
                  totalQuestions={questions.length}
                  onAnswer={handleAnswer}
                  onPrevious={handlePrevious}
            direction={direction}
          />
        ) : (
          <ResultScreen
            score={score}
            riskLevel={riskLevel}
            loading={loading}
            error={error}
            onReset={resetAssessment}
            detailedResult={detailedResult}
          />
        )}
      </div>
    </div>
  );
};

export default Assessment; 