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

// Combine all data chunks
// Combine all data chunks with BALANCED SLICING
// Strategy: Core (10) + Figures (8) + ~8 per category = ~88 Total
// This ensures no category is empty while respecting the strict limit.

const rawData = [
  ...coreData, // Keep all Core (High Quality) - Pinned at Top
  ...philosophyData,
  ...performanceData,
  ...biohackingData,
  ...spiritualityData,
  ...psychologyData,
  ...wealthData,
  ...leadershipData,
  ...focusData,
  ...modernScienceData,
  ...figuresData
]; // Total candidates: ~160+. Strict Cover Logic will filter this down to a robust ~100.

// Deduplicate by ID just in case
const uniqueDataMap = new Map();
rawData.forEach(item => {
  const key = item.title.toLowerCase().trim(); 
  if (!uniqueDataMap.has(key)) {
    uniqueDataMap.set(key, item);
  }
});

export const knowledgeData = Array.from(uniqueDataMap.values());
