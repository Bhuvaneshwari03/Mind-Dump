const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Valid categories that the AI can return
const VALID_CATEGORIES = ['work', 'shopping', 'idea', 'personal', 'reminder', 'health', 'travel', 'random'];

// Category mapping for common variations and synonyms
const CATEGORY_MAPPING = {
  // Work variations
  'job': 'work',
  'office': 'work',
  'career': 'work',
  'business': 'work',
  'meeting': 'work',
  'project': 'work',
  'task': 'work',
  'deadline': 'work',
  
  // Shopping variations
  'buy': 'shopping',
  'purchase': 'shopping',
  'store': 'shopping',
  'grocery': 'shopping',
  'groceries': 'shopping',
  'market': 'shopping',
  
  // Idea variations
  'concept': 'idea',
  'thought': 'idea',
  'brainstorm': 'idea',
  'innovation': 'idea',
  'creative': 'idea',
  
  // Personal variations
  'self': 'personal',
  'me': 'personal',
  'myself': 'personal',
  'life': 'personal',
  'family': 'personal',
  'relationship': 'personal',
  
  // Reminder variations
  'todo': 'reminder',
  'remember': 'reminder',
  'note': 'reminder',
  'appointment': 'reminder',
  'schedule': 'reminder',
  'calendar': 'reminder',
  
  // Health variations
  'medical': 'health',
  'doctor': 'health',
  'fitness': 'health',
  'exercise': 'health',
  'wellness': 'health',
  'diet': 'health',
  
  // Travel variations
  'trip': 'travel',
  'vacation': 'travel',
  'journey': 'travel',
  'flight': 'travel',
  'hotel': 'travel',
  'destination': 'travel',
};

// Normalize and map category
const normalizeCategory = (rawCategory) => {
  if (!rawCategory || typeof rawCategory !== 'string') {
    console.log('❌ Invalid category input:', rawCategory);
    return 'random';
  }

  // Clean the category response - remove all non-alphabetic characters and convert to lowercase
  const cleaned = rawCategory.trim().toLowerCase().replace(/[^a-z]/gi, '');
  console.log('🧹 Cleaned category:', cleaned);
  
  // Check if it's a valid category
  if (VALID_CATEGORIES.includes(cleaned)) {
    console.log('✅ Valid category found:', cleaned);
    return cleaned;
  }
  
  // Check if it maps to a valid category
  if (CATEGORY_MAPPING[cleaned]) {
    console.log('🔄 Mapped category:', cleaned, '->', CATEGORY_MAPPING[cleaned]);
    return CATEGORY_MAPPING[cleaned];
  }
  
  // Check for partial matches (in case of typos)
  for (const validCategory of VALID_CATEGORIES) {
    if (cleaned.includes(validCategory) || validCategory.includes(cleaned)) {
      console.log('🔍 Partial match found:', cleaned, '->', validCategory);
      return validCategory;
    }
  }
  
  // Check mapping keys for partial matches
  for (const [key, value] of Object.entries(CATEGORY_MAPPING)) {
    if (cleaned.includes(key) || key.includes(cleaned)) {
      console.log('🔍 Partial mapping match found:', cleaned, '->', value);
      return value;
    }
  }
  
  console.log('❌ No valid category match found, defaulting to random');
  return 'random';
};

// Normalize type response
const normalizeType = (rawType) => {
  if (!rawType || typeof rawType !== 'string') {
    console.log('❌ Invalid type input:', rawType);
    return 'thought';
  }

  const cleaned = rawType.trim().toLowerCase().replace(/[^a-z]/gi, '');
  console.log('🧹 Cleaned type:', cleaned);
  
  // Check for task indicators
  if (cleaned.includes('task') || cleaned.includes('action') || cleaned.includes('todo')) {
    console.log('✅ Task type found:', cleaned);
    return 'task';
  }
  
  // Default to thought
  console.log('💭 Defaulting to thought type');
  return 'thought';
};

export const categorizeThoughtWithGemini = async (thought) => {
  console.log('🤖 Starting Gemini categorization for:', thought);
  
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ Gemini API key not found, falling back to defaults');
      return { category: 'random', type: 'thought' };
    }

    // Enhanced prompt with clear instructions for both category and type analysis
    const prompt = `Analyze the following user input and provide a JSON response with two determinations:

1. CATEGORY: Categorize into one of these exact categories: work, shopping, idea, personal, reminder, health, travel, random
2. TYPE: Determine if this is an actionable task or just a thought/statement

IMPORTANT INSTRUCTIONS:
- Respond with valid JSON only: {"category": "...", "type": "..."}
- Category must be one of: work, shopping, idea, personal, reminder, health, travel, random
- Type must be either "task" or "thought"

TYPE DEFINITIONS:
- "task": Something actionable the user can do, complete, or accomplish (e.g., "buy groceries", "call mom", "finish report", "go for a run")
- "thought": A reflection, idea, statement, or observation without a clear action (e.g., "I love sunsets", "wondering about life", "feeling grateful", "random idea about flying cars")

EXAMPLES:
- "Buy groceries tomorrow" → {"category": "shopping", "type": "task"}
- "I love how peaceful mornings are" → {"category": "personal", "type": "thought"}
- "Schedule dentist appointment" → {"category": "health", "type": "task"}
- "What if we could teleport?" → {"category": "idea", "type": "thought"}
- "Finish the quarterly report" → {"category": "work", "type": "task"}
- "Feeling grateful for my family" → {"category": "personal", "type": "thought"}

User input: "${thought}"

JSON Response:`;
    
    console.log('📤 Sending request to Gemini API...');
    
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1, // Low temperature for consistent results
          maxOutputTokens: 50, // Short response expected
          topP: 0.8,
          topK: 10
        }
      })
    });

    if (!response.ok) {
      console.warn(`⚠️ Gemini API error: ${response.status} ${response.statusText}, falling back to defaults`);
      return { category: 'random', type: 'thought' };
    }

    const data = await response.json();
    console.log('📥 Full Gemini API response:', JSON.stringify(data, null, 2));
    
    // Extract the response text
    const rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('🎯 Raw Gemini response:', `"${rawResponse}"`);
    
    try {
      // Try to parse as JSON
      const jsonMatch = rawResponse.match(/\{[^}]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        console.log('📊 Parsed JSON response:', parsedResponse);
        
        const finalCategory = normalizeCategory(parsedResponse.category);
        const finalType = normalizeType(parsedResponse.type);
        
        console.log('✅ Final analysis result:', { category: finalCategory, type: finalType });
        return { category: finalCategory, type: finalType };
      }
    } catch (parseError) {
      console.warn('⚠️ Failed to parse JSON response:', parseError);
    }
    
    // Fallback: try to extract category and type from text
    const categoryMatch = rawResponse.match(/category["\s:]*([a-zA-Z]+)/i);
    const typeMatch = rawResponse.match(/type["\s:]*([a-zA-Z]+)/i);
    
    const finalCategory = normalizeCategory(categoryMatch?.[1] || 'random');
    const finalType = normalizeType(typeMatch?.[1] || 'thought');
    
    console.log('✅ Fallback analysis result:', { category: finalCategory, type: finalType });
    return { category: finalCategory, type: finalType };
    
  } catch (error) {
    console.error('❌ Gemini analysis failed:', error);
    console.log('🔄 Falling back to defaults');
    return { category: 'random', type: 'thought' };
  }
};