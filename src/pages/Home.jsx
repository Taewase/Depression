import React from 'react';
import { ArrowRight, Brain, BookOpen, BarChart3, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'About MindCare',
      description: 'MindCare is a comprehensive mental wellness platform designed to support your journey towards better mental health through evidence-based assessments and personalized care.',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Our Mission',
      description: 'We are committed to making mental health support accessible, confidential, and effective for everyone, providing tools and resources to improve your overall well-being.',
      color: 'from-pink-500 to-rose-600'
    },
    {
      title: 'Privacy & Security',
      description: 'Your privacy is our top priority. All assessments, data, and personal information are kept completely confidential and secure using industry-standard encryption.',
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Professional Network',
      description: 'Connect with licensed mental health professionals, therapists, and support groups in your area through our carefully curated network of qualified providers.',
      color: 'from-purple-500 to-violet-600'
    }
  ];

  const resources = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: 'Educational Articles',
      description: 'Learn about mental health, wellness strategies, and coping mechanisms.'
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Progress Tracking',
      description: 'Monitor your mental wellness journey with detailed insights and progress reports.'
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'Wellness Tips',
      description: 'Daily tips and practices to improve your mental health and overall well-being.'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen">
      {/* Hero Section */}
      <div className="relative px-6 lg:px-8 pt-16 pb-24">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 lg:p-12">
          <div className="text-left">
            <div className="mb-10">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl mb-6">
                Your Mental Wellness{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Companion
                </span>
              </h1>
              <p className="text-xl leading-8 text-slate-600 dark:text-slate-300 max-w-3xl">
                Take the first step towards a healthier mind. Our confidential assessment is quick, easy, and designed to provide you with immediate insights and personalized recommendations.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <button
                onClick={() => navigate('/assessment')}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                Take Free Assessment
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 lg:px-8 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              About MindCare
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;