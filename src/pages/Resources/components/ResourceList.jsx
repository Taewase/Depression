import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';

const ResourceList = ({ resources }) => {
  return (
    <div className="grid gap-6">
      {resources.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500">No resources found matching your criteria.</p>
        </div>
      ) : (
        resources.map((resource, index) => (
          <div
            key={index}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-neutral-800 mb-3 group-hover:text-primary-600 transition-colors">
                    {resource.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                    <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full font-medium">
                      {resource.category}
                    </span>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1.5" />
                      {resource.readTime}
                    </div>
                  </div>
                </div>
                {resource.featured && (
                  <span className="bg-secondary-50 text-secondary-700 text-xs px-3 py-1 rounded-full font-medium">
                    Featured
                  </span>
                )}
              </div>
              <p className="text-neutral-600 mb-6 line-clamp-2">
                {resource.excerpt}
              </p>
              <button className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm group-hover:translate-x-0.5 transition-transform">
                Read More
                <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ResourceList; 