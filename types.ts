
export enum VerificationStatus {
  UNVERIFIED = 'Unverified',
  VERIFYING = 'Verifying',
  REAL = 'Real',
  FAKE = 'Fake',
  DILEMMA = 'Dilemma',
}

export const CATEGORIES = ['Health', 'Politics', 'Technology', 'Society', 'Environment', 'Other'] as const;
export type Category = typeof CATEGORIES[number];

export interface Vote {
  id: string;
  isReal: boolean;
  location: string; 
  timestamp: string;
}

export interface ResponseItem {
    id: string;
    authorId: string;
    authorUsername: string;
    text: string;
}

export interface Evidence {
  id: string;
  text: string;
  imageUrl?: string;
  authorLocation: string;
  likes: string[]; // Array of User IDs
  responses: ResponseItem[];
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  location: string;
  category: Category;
  votes: Vote[];
  evidence: Evidence[];
  clicks: number;
  verification: {
    status: VerificationStatus;
    confidence?: number;
    reasoning?: string;
    isAiGenerated?: boolean;
  };
  userVote: boolean | null;
  userVoteId: string | null;
  userVoteCount: number;
  sharedByUser: boolean;
  createdAt: string;
}

export interface GeolocationState {
    latitude: number | null;
    longitude: number | null;
    error: string | null;
}

export interface User {
  id: string;
  username: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  dob: string; 
  location: string;
  credits: number;
  preferredCategories: Category[];
}