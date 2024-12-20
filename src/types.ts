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
  actorId?: string;
};

export const QueueItemStatus = {
  Processing: 'processing',
  Pending: 'pending',
  Accepted: 'accepted',
  Rejected: 'rejected',
} as const;

export type QueueItemStatus =
  (typeof QueueItemStatus)[keyof typeof QueueItemStatus];

export type QueueItemResponse = {
  id: string;
  status: QueueItemStatus;
  accepted?: boolean;
  content?: string;
  moderation?: TextModerationResponse;
};

export const WebhookEvent = {
  ModerationCompleted: 'moderation.completed',
  QueueReviewCompleted: 'queue.review.completed',
} as const;

export type WebhookEvent = (typeof WebhookEvent)[keyof typeof WebhookEvent];
export type WebhookBody<T extends WebhookEvent = 'moderation.completed'> = {
  event: T;
  data: WebhookData<T>;
};

export type WebhookData<T extends WebhookEvent> =
  T extends 'moderation.completed'
    ? TextModerationResponse
    : T extends 'queue.review.completed'
      ? QueueItemResponse
      : {};
