import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import axios from 'axios';

const ArticleView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://depression-41o5.onrender.com/api/articles/${id}`);
        setArticle(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load the article. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-red-50 dark:bg-red-900 border-2 border-red-200 dark:border-red-800 rounded-xl p-6">
            <p className="text-red-600 dark:text-red-300 text-center">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Article Not Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">The article you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/resources')}
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Resources
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 py-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/resources')}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Resources
        </button>

        {/* Article Header */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 mb-8">
          <span className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full text-sm font-bold mb-6">
            {article.category}
          </span>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 mb-8">
            <div className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              <span>{new Date(article.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 mb-16">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {article.article.split('\n').map((paragraph, index) => (
              paragraph ? <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{paragraph}</p> : <br key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleView; 