export interface Actor {
    id: number;
    name: string;
    profile_path?: string;
    known_for?: Array<{
      title?: string;
      name?: string;
    }>;
    valueMetrics?: ActorValueMetrics;
  }
  
  export interface ActorValueMetrics {
    globalValue: number;
    territoryValues: Record<string, number>;
    genreStrength: Record<string, number>;
  }
  
  export interface ProjectDetails {
    title: string;
    budget: string;
    genre: string;
    director: string;
    cast: Actor[];
  }
  
  export interface MarketEstimates {
    regions: Record<string, RegionEstimate>;
    total: {
      ask: number;
      take: number;
    };
  }
  
  export interface RegionEstimate {
    territories: Record<string, TerritoryEstimate>;
    totalAsk: number;
    totalTake: number;
  }
  
  export interface TerritoryEstimate {
    ask: number;
    take: number;
  }