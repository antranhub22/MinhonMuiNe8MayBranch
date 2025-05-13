import React from 'react';
import { cn } from '@/lib/utils';

interface ReferenceCategoriesProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const ReferenceCategories: React.FC<ReferenceCategoriesProps> = ({
  categories,
  activeCategory,
  onCategoryChange
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center flex-wrap gap-2">
        {/* Removed "Category:" label as requested */}
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              activeCategory === category
                ? "bg-blue-700 text-white shadow-md"
                : "bg-white/90 text-blue-900 hover:bg-blue-50"
            )}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReferenceCategories; 