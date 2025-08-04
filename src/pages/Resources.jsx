import React, { useState, useEffect } from 'react';
import { ArrowRight, Heart, Shield, Users, Search, Filter } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 9;

  // Fetch articles and categories when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch categories
        const categoriesResponse = await axios.get('http://localhost:5000/api/articles/categories');
        setCategories(['all', ...categoriesResponse.data]);
        
        // Fetch articles
        const articlesUrl = selectedCategory === 'all' 
          ? 'http://localhost:5000/api/articles'
          : `http://localhost:5000/api/articles?category=${selectedCategory}`;
        
        const articlesResponse = await axios.get(articlesUrl);
        setArticles(articlesResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load resources. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]); // Refetch when category changes

  // Filter articles based on search term
  const filteredArticles = articles.filter(article => {
    console.log('Article data:', article); // Add logging to see article data
    const matchesSearch = searchTerm === '' ||
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.article.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * articlesPerPage,
    currentPage * articlesPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">Mental Health Resources</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
            Evidence-based educational content and comprehensive support materials for your mental wellness journey
          </p>
        </div>

        {/* Search Interface */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Search Resources</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {(searchTerm || selectedCategory !== 'all') && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredArticles.length} result{filteredArticles.length !== 1 ? 's' : ''}
              {searchTerm && ` for "${searchTerm}"`}
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading resources...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
            <p className="text-red-600 dark:text-red-300 text-center">{error}</p>
          </div>
        )}

        {/* No Results Message */}
        {!loading && !error && filteredArticles.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-12 mb-16 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Resources Found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We couldn't find any resources matching your search criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Articles Grid */}
        {!loading && !error && filteredArticles.length > 0 && (
          <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedArticles.map((article, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-base font-bold">
                    {article.category}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-base">
                    {new Date(article.date).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 leading-tight">{article.title}</h3>
                <div className="text-gray-700 dark:text-gray-300 text-base mb-4 leading-relaxed font-serif space-y-2">
                  {article.article
                    .substring(0, 150)
                    .split('\n')
                    .map((para, idx) => (
                      <p key={idx} className="mb-2">{para}...</p>
                    ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">By {article.author}</span>
                  <button 
                    onClick={() => {
                      console.log('Navigating to article:', article.id); // Add logging for navigation
                      navigate(`/article/${article.id}`);
                    }}
                    className="text-purple-600 dark:text-purple-400 font-semibold text-base hover:text-purple-800 dark:hover:text-purple-300 flex items-center"
                  >
                  Read More <ArrowRight className="ml-1 h-4 w-4" />
                </button>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="inline-flex -space-x-px">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 border border-gray-300 dark:border-gray-700 text-base font-medium ${currentPage === i + 1 ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300'} rounded-l-md first:rounded-l-lg last:rounded-r-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors`}
                  >
                    {i + 1}
                  </button>
                ))}
              </nav>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );

       };

export default Resources;