export const THOUGHT_CATEGORIES = [
  'Personal',
  'Work',
  'Ideas',
  'Goals',
  'Reflections',
  'Random',
  'Creative',
  'Learning',
  'Health',
  'Relationships'
] as const;

export type ThoughtCategory = typeof THOUGHT_CATEGORIES[number];

export const CATEGORY_COLORS: Record<ThoughtCategory, string> = {
  'Personal': 'bg-primary-100 text-primary-800',
  'Work': 'bg-gray-100 text-gray-800',
  'Ideas': 'bg-mint-100 text-mint-800',
  'Goals': 'bg-lavender-100 text-lavender-800',
  'Reflections': 'bg-blue-100 text-blue-800',
  'Random': 'bg-yellow-100 text-yellow-800',
  'Creative': 'bg-pink-100 text-pink-800',
  'Learning': 'bg-green-100 text-green-800',
  'Health': 'bg-red-100 text-red-800',
  'Relationships': 'bg-purple-100 text-purple-800',
};