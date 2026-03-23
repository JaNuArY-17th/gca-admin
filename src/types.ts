export type DateRange = {
  startDate: string;
  endDate: string;
};

export type VoteStats = {
  totalVoteRecords: number;
  totalVoters: number;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
};

export interface Category {
  id: string;
  slug: string;
  title: string;
}

export interface VoteNomineeResponse {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
}

export type NomineeSummary = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  votes: number;
};

export type VoterRow = {
  id: string;
  fullname: string;
  mssv: string;
  email: string;
  hasVoted: boolean;
  votesInRange: number;
  lastVotedAt?: string;
};

export type VoterListResponse = {
  page: number;
  pageSize: number;
  total: number;
  items: VoterRow[];
};
