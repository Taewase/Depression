import React, {useState} from 'react'
import { BookOpen, ArrowRight } from 'lucide-react';

const Books = () => {
  const books = [
    {
      title: "The Body Keeps the Score",
      author: "Bessel van der Kolk",
      excerpt: "Trauma treatment and recovery insights from a leading expert.",
      category: "Trauma"
    },
    // Add more books...
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">Recommended Books</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium leading-relaxed">
            Curated selection of mental health books recommended by professionals
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="w-full h-48 bg-purple-100 rounded-xl mb-4 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-purple-600" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                  {book.category}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{book.title}</h3>
              <p className="text-gray-500 text-sm mb-3">{book.author}</p>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">{book.excerpt}</p>
              <button className="text-purple-600 font-semibold text-sm hover:text-purple-800 flex items-center">
                Learn More <ArrowRight className="ml-1 h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Books;