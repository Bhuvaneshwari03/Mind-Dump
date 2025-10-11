import { ThoughtCategory } from '../constants/categories';

// Placeholder AI categorization logic
// TODO: Replace with actual AI service integration
export const categorizeThought = async (content: string): Promise<ThoughtCategory> => {
  const lowercaseContent = content.toLowerCase();
  
  // Simple keyword-based categorization (placeholder)
  const categoryKeywords: Record<ThoughtCategory, string[]> = {
    'Personal': ['i feel', 'my life', 'personal', 'myself', 'emotion', 'mood'],
    'Work': ['project', 'meeting', 'deadline', 'team', 'office', 'career', 'job'],
    'Ideas': ['what if', 'idea', 'concept', 'invention', 'solution', 'innovation'],
    'Goals': ['goal', 'want to', 'should', 'plan to', 'achieve', 'improve', 'learn'],
    'Reflections': ['reflect', 'thinking about', 'realized', 'understand', 'wisdom'],
    'Random': ['random', 'weird', 'funny', 'strange', 'interesting'],
    'Creative': ['create', 'art', 'design', 'music', 'write', 'paint', 'craft'],
    'Learning': ['learn', 'study', 'education', 'skill', 'knowledge', 'course'],
    'Health': ['health', 'exercise', 'fitness', 'diet', 'medical', 'wellness'],
    'Relationships': ['friend', 'family', 'relationship', 'love', 'social', 'people']
  };

  // Find the category with the most keyword matches
  let bestMatch: ThoughtCategory = 'Random';
  let maxMatches = 0;

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const matches = keywords.filter(keyword => 
      lowercaseContent.includes(keyword)
    ).length;
    
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = category as ThoughtCategory;
    }
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return bestMatch;
};

// Placeholder tag generation logic
// TODO: Replace with actual AI service integration
export const generateTags = async (content: string): Promise<string[]> => {
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Simple tag extraction (placeholder)
  const commonTags = ['idea', 'goal', 'work', 'personal', 'health', 'learning'];
  const tags = words.filter(word => 
    commonTags.includes(word) || words.filter(w => w === word).length > 1
  );

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return [...new Set(tags)].slice(0, 5); // Return unique tags, max 5
};