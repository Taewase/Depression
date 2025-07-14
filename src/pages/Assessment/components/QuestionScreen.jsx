import React from 'react';
import { ArrowLeft, Brain, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight } from 'lucide-react';
import ProgressBar from '../../../components/common/ProgressBar';

const QuestionScreen = ({
  currentQuestion,
  totalQuestions,
  question,
  onAnswer,
  onPrevious,
  canGoPrevious
}) => {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="glass-card overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5" />
      <div className="relative">
        <ProgressBar progress={progress} showValue />
        
        <div className="p-8 md:p-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 rotate-6 absolute top-0 left-0 animate-pulse" />
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center relative">
                  <Brain className="h-8 w-8 text-primary-500" />
                </div>
              </div>
            </div>
            <h2 className="text-3xl font-display font-bold text-gradient mb-3">
              Question {currentQuestion + 1}
            </h2>
            <div className="flex items-center justify-center space-x-3 text-sm font-medium">
              <div className="flex items-center space-x-2">
                <ChevronLeft className={`h-4 w-4 ${canGoPrevious ? 'text-primary-500' : 'text-gray-300'}`} />
                <span className="text-primary-500">{currentQuestion + 1}</span>
              </div>
              <div className="h-px w-12 bg-gray-200"></div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">{totalQuestions}</span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </div>
            </div>
          </div>
          
          <div className="mb-12">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-3xl blur-lg opacity-30 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative glass-card p-8 shadow-lg">
                <h3 className="text-2xl text-gray-800 text-center font-medium leading-relaxed">
                  {question}
                </h3>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-lg mx-auto mt-12">
              <button
                onClick={() => onAnswer(0)}
                className="group relative px-8 py-6 rounded-xl bg-white border-2 border-gray-100 hover:border-primary-100 transition-all duration-300 hover:shadow-lg"
              >
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-3 group-hover:bg-primary-50 transition-colors">
                    <ThumbsDown className="h-7 w-7 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mb-1">No</div>
                  <div className="text-sm text-gray-500">I don't experience this</div>
                </div>
                <div className="absolute inset-0 bg-primary-50 rounded-xl scale-0 transition-transform duration-300 group-hover:scale-100" />
              </button>
              
              <button
                onClick={() => onAnswer(1)}
                className="group relative px-8 py-6 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300"
              >
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors">
                    <ThumbsUp className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-lg font-semibold mb-1">Yes</div>
                  <div className="text-sm text-white/80">I experience this</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                !canGoPrevious
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:text-primary-500 hover:bg-primary-50'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-primary-500"></div>
              <span className="text-sm font-medium text-primary-600">
                {Math.round(progress)}% Complete
              </span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 p-6 bg-gray-50/50">
          <p className="text-sm text-gray-500 text-center max-w-2xl mx-auto">
            This assessment is based on the clinically validated SRQ-20 screening questionnaire. Your responses are confidential and will help us provide appropriate guidance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuestionScreen; 