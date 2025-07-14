import React, { useState } from 'react';
import ResourceList from './components/ResourceList';
import ResourceFilters from './components/ResourceFilters';
import { resources } from './data/resources';

const Resources = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-neutral-50 font-sans">
      <div className="flex">
        {/* Sidebar Filters */}
        <div className="w-72 bg-white border-r border-neutral-200 min-h-[calc(100vh-3.5rem)] flex-shrink-0">
          <div className="sticky top-0">
            <ResourceFilters
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-4xl mx-auto px-8 py-10">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold text-neutral-800 mb-3">Mental Health Resources</h1>
              <p className="text-neutral-500">
                Explore our curated collection of mental health resources, articles, and support materials.
              </p>
            </div>
            <ResourceList resources={filteredResources} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources; 