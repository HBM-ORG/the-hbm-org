import { coreData } from './knowledgeDataChunks/knowledgeData_Core';
import { philosophyData } from './knowledgeDataChunks/knowledgeData_Philosophy';
import { performanceData } from './knowledgeDataChunks/knowledgeData_Performance';
import { biohackingData } from './knowledgeDataChunks/knowledgeData_Biohacking';
import { spiritualityData } from './knowledgeDataChunks/knowledgeData_Spirituality';
import { psychologyData } from './knowledgeDataChunks/knowledgeData_Psychology';
import { wealthData } from './knowledgeDataChunks/knowledgeData_Wealth';
import { leadershipData } from './knowledgeDataChunks/knowledgeData_Leadership';
import { focusData } from './knowledgeDataChunks/knowledgeData_Focus';
import { modernScienceData } from './knowledgeDataChunks/knowledgeData_ModernScience';
import { figuresData } from './knowledgeDataChunks/knowledgeData_Figures';

export const knowledgeCategories = [
  'All',
  'Performance',
  'Biohacking',
  'Spirituality',
  'Psychology',
  'Wealth',
  'Leadership',
  'Philosophy',
  'Focus',
  'Modern Science'
];

/**
 * CURATION STRATEGY: 
 * To prevent overwhelming the user and ensure high-quality discovery,
 * we strictly limit each category to the 8 most iconic/well-known titles.
 * The source chunks are already ordered by "Big 8" importance.
 */

const rawData = [
  ...coreData, // Essential Pinned Books (Atomic Habits, Sapiens, etc.)
  ...philosophyData.slice(0, 8),
  ...performanceData.slice(0, 8),
  ...biohackingData.slice(0, 8),
  ...spiritualityData.slice(0, 8),
  ...psychologyData.slice(0, 8),
  ...wealthData.slice(0, 8),
  ...leadershipData.slice(0, 8),
  ...focusData.slice(0, 8),
  ...modernScienceData.slice(0, 8),
  ...figuresData.slice(0, 10) // Key Figures
];

// Deduplicate by Title (normalized) to ensure clean listing
const uniqueDataMap = new Map();
rawData.forEach(item => {
  const key = item.title.toLowerCase().trim(); 
  if (!uniqueDataMap.has(key)) {
    uniqueDataMap.set(key, item);
  }
});

export const knowledgeData = Array.from(uniqueDataMap.values());
