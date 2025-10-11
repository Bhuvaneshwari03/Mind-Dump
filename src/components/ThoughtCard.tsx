import React from 'react';
import { Calendar, Tag } from 'lucide-react';
import { CATEGORY_COLORS, ThoughtCategory } from '../constants/categories';

interface ThoughtCardProps {
  id: string;
  content: string;
  category: ThoughtCategory;
  createdAt: Date;
  tags?: string[];
}

const ThoughtCard: React.FC<ThoughtCardProps> = ({ 
  content, 
  category, 
  createdAt, 
  tags = [] 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:border-primary-200 dark:hover:border-primary-600 group">
      <div className="flex items-start justify-between mb-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[category]}`}>
          <Tag className="h-3 w-3 mr-1" />
          {category}
        </span>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="h-3 w-3 mr-1" />
          {createdAt.toLocaleDateString()}
        </div>
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-200">
        {content}
      </p>
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md text-xs hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThoughtCard;