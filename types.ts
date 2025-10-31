
export enum VerificationStatus {
  UNVERIFIED = 'Unverified',
  VERIFYING = 'Verifying',
  REAL = 'Real',
  FAKE = 'Fake',
  DILEMMA = 'Dilemma',
}

export interface Vote {
  id: string;
  isReal: boolean;
  location: string; 
}

export interface Evidence {
  id: string;
  text: string;
  imageUrl?: string;
  authorLocation: string;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  location: string;
  votes: Vote[];
  evidence: Evidence[];
  clicks: number;
  verification: {
    status: VerificationStatus;
    confidence?: number;
    reasoning?: string;
    isAiGenerated?: boolean;
  };
  userHasVoted: boolean;
}

export interface GeolocationState {
    latitude: number | null;
    longitude: number | null;
    error: string | null;
}
