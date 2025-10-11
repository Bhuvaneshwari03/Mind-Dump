import { useState, useEffect } from 'react';
import { ThoughtCategory } from '../constants/categories';

export interface Thought {
  id: string;
  content: string;
  category: ThoughtCategory;
  createdAt: Date;
  tags?: string[];
}

export const useThoughts = () => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addThought = async (content: string) => {
    setIsLoading(true);
    
    // TODO: Replace with actual AI categorization and backend storage
    const newThought: Thought = {
      id: Date.now().toString(),
      content,
      category: 'Random', // Placeholder - will be AI categorized
      createdAt: new Date(),
      tags: [] // Placeholder - will be AI generated
    };

    setThoughts(prev => [newThought, ...prev]);
    setIsLoading(false);
    
    return newThought;
  };

  const updateThought = async (id: string, updates: Partial<Thought>) => {
    setThoughts(prev => 
      prev.map(thought => 
        thought.id === id ? { ...thought, ...updates } : thought
      )
    );
  };

  const deleteThought = async (id: string) => {
    setThoughts(prev => prev.filter(thought => thought.id !== id));
  };

  const getThoughtsByCategory = (category: ThoughtCategory) => {
    return thoughts.filter(thought => thought.category === category);
  };

  const searchThoughts = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return thoughts.filter(thought =>
      thought.content.toLowerCase().includes(lowercaseQuery) ||
      thought.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  return {
    thoughts,
    isLoading,
    addThought,
    updateThought,
    deleteThought,
    getThoughtsByCategory,
    searchThoughts
  };
};