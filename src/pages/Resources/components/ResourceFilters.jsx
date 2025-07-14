import React from 'react';
import { Search, Filter } from 'lucide-react';
import { categories } from '../data/categories';

const ResourceFilters = ({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange
}) => {
  return (
    <div className="p-6 space-y-8">
      {/* Search */}
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-4 w-4 text-neutral-400" />
          <h3 className="font-display font-bold text-neutral-800">Categories</h3>
        </div>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange('all')}
            className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            All Resources
          </button>
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => onCategoryChange(category.value)}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                selectedCategory === category.value
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourceFilters;