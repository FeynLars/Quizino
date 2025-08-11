import React from 'react';

interface CategorySelectorProps {
  categories: string[];
  onSelect: (category: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ categories, onSelect }) => {
  return (
    <div>
      <h3>Velg kategori:</h3>
      <ul>
        {categories.map((category) => (
          <li key={category}>
            <button onClick={() => onSelect(category)}>{category}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategorySelector;
