export type SignType = 'text' | 'image';

export type TextModerationResponse = {
  id: string;
  isSafe: boolean;
  confidence: number;
  sentiment: 'negative' | 'neutral' | 'positive';
  sentimentScore: number;
  riskScores: {
    overall: number;
    spam: number;
    toxicity: number;
  };
  topics: string[];
  nsfwCategories: Array<{ category: string; severity: number }>;
  summary: {
    profanity: boolean;
    totalFlags: number;
    contentRating: string;
    language: string; // Language code e.g. en;
  };
  suggestedActions: {
    reject: boolean;
    review: boolean;
  };
  content: string;
  filteredContent: string;
  original: string;
  request: {
    requestId: string;
    timestamp: string;
  };
  meta: Record<string, any>;
};
