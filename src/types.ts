export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  tags: string[];
  stars: number;
  activeContributors: number;
  monthlySponsors: number;
  currentFunding: number;
  goalFunding: number;
  maintainerName: string;
  maintainerAvatar: string;
  recentSponsors: Sponsor[];
}

export interface Sponsor {
  id: string;
  name: string;
  avatar: string;
  amount: number;
  tierName: string;
  message?: string;
  timestamp: string;
  projectName: string;
}

export interface ChartDataPoint {
  date: string;
  funding: number;
  contributors: number;
}

export interface HeatmapCell {
  date: string;
  count: number;
  intensity: 0 | 1 | 2 | 3 | 4; // for heat colors
}
