import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';

const Articles = () => {
  const articles = [
    {
      title: "Understanding Mental Health: A Comprehensive Guide",
      excerpt: "Learn about the fundamentals of mental health and common conditions.",
      category: "Education",
      readTime: "10 min read"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">Mental Health Articles</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium leading-relaxed">
            Evidence-based articles to support your mental wellness journey
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                  {article.category}
                </span>
                <span className="text-gray-500 text-xs">{article.readTime}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">{article.title}</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">{article.excerpt}</p>
              <button className="text-purple-600 font-semibold text-sm hover:text-purple-800 flex items-center">
                Read Article <ArrowRight className="ml-1 h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Articles;