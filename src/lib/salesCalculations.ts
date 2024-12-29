"use strict";

// Types and Interfaces
interface BoxOfficeMetrics {
  globalRevenue: number;
  domesticRevenue: number;
  internationalRevenue: number;
  leadRolePerformance: number;
  genreSpecificSuccess: number;
  territoryStrength: Record<string, number>;
}

interface ActorMarketValue {
  globalValue: number;
  territoryMultipliers: Record<string, number>;
  genrePerformance: Record<string, number>;
  recentBoxOffice: BoxOfficeMetrics;
  marketAppeal: {
    domestic: number;
    international: number;
    genreSpecific: Record<string, number>;
  };
}

export interface ActorValue {
  globalValue: number;
  territoryValues: Record<string, number>;
  genreStrength: Record<string, number>;
  leadingRoleValue: number;
}

// Market Data
export const marketRegions = {
  northAmerica: ['usa', 'canada'],
  europe: ['uk', 'france', 'germany', 'italy', 'spain', 'benelux', 'scandinavia'],
  asia: ['china', 'japan', 'southKorea', 'india'],
  latinAmerica: ['brazil', 'mexico', 'argentina'],
  oceania: ['australia', 'newZealand'],
  other: ['middleEast', 'africa']
};

export const marketMultipliers = {
  territories: {
    northAmerica: {
      usa: {
        baseMultiplier: 0.40,
        takeRate: 0.60,
        genreFactors: {
          action: 1.2,
          thriller: 1.1,
          drama: 0.8,
          horror: 1.3,
          comedy: 1.0,
          family: 1.15,
          sciFi: 1.25
        },
        castValueImpact: 1.3
      },
      canada: {
        baseMultiplier: 0.10,
        takeRate: 0.55,
        genreFactors: {
          action: 1.1,
          thriller: 1.0,
          drama: 0.9,
          horror: 1.2,
          comedy: 1.0,
          family: 1.1,
          sciFi: 1.15
        },
        castValueImpact: 1.2
      }
    },
    europe: {
      uk: {
        baseMultiplier: 0.20,
        takeRate: 0.50,
        genreFactors: {
          action: 1.1,
          thriller: 1.1,
          drama: 1.2,
          horror: 1.0,
          comedy: 0.9,
          family: 1.0,
          sciFi: 1.1
        },
        castValueImpact: 1.2
      },
      germany: {
        baseMultiplier: 0.15,
        takeRate: 0.50,
        genreFactors: {
          action: 1.15,
          thriller: 1.1,
          drama: 1.0,
          horror: 0.9,
          comedy: 1.0,
          family: 1.1,
          sciFi: 1.2
        },
        castValueImpact: 1.1
      },
      france: {
        baseMultiplier: 0.12,
        takeRate: 0.50,
        genreFactors: {
          action: 1.1,
          thriller: 1.1,
          drama: 1.3,
          horror: 0.8,
          comedy: 1.1,
          family: 0.9,
          sciFi: 1.0
        },
        castValueImpact: 1.15
      }
    },
    asia: {
      china: {
        baseMultiplier: 0.25,
        takeRate: 0.40,
        genreFactors: {
          action: 1.4,
          thriller: 1.0,
          drama: 0.7,
          horror: 0.8,
          comedy: 0.6,
          family: 1.2,
          sciFi: 1.3
        },
        castValueImpact: 1.1
      }
    }
  },
  budgetTiers: {
    indie: {
      min: 0,
      max: 5000000,
      multiplier: 0.8
    },
    midBudget: {
      min: 5000000,
      max: 20000000,
      multiplier: 1.0
    },
    highBudget: {
      min: 20000000,
      max: 100000000,
      multiplier: 1.2
    }
  }
};

// Actor Value Calculations
export async function calculateActorMarketValue(actor: any): Promise<ActorValue> {
  const boxOfficeMetrics = await calculateActorBoxOfficeValue(actor);
  const territoryValues = calculateTerritoryValues(boxOfficeMetrics);
  
  return {
    globalValue: boxOfficeMetrics.marketAppeal.domestic,
    territoryValues: territoryValues,
    genreStrength: boxOfficeMetrics.genrePerformance,
    leadingRoleValue: boxOfficeMetrics.recentBoxOffice.leadRolePerformance
  };
}

async function calculateActorBoxOfficeValue(actor: any): Promise<any> {
  const recentMovies = actor.known_for?.filter((movie: any) => {
    const releaseDate = new Date(movie.release_date);
    const yearsAgo = (new Date().getFullYear() - releaseDate.getFullYear());
    const isRecentEnough = yearsAgo <= 5;
    const isLeadRole = movie.order <= 3;
    
    return movie.media_type === 'movie' && isRecentEnough;
  }) || [];

  const boxOfficeMetrics: BoxOfficeMetrics = {
    globalRevenue: 0,
    domesticRevenue: 0,
    internationalRevenue: 0,
    leadRolePerformance: 0,
    genreSpecificSuccess: 0,
    territoryStrength: {}
  };

  // Process each movie's contribution to actor value
  recentMovies.forEach(movie => {
    const revenueImpact = movie.revenue ? movie.revenue / 100000000 : 0;
    const isLeadRole = movie.order <= 2;
    const yearsAgo = new Date().getFullYear() - new Date(movie.release_date).getFullYear();
    const recencyMultiplier = Math.pow(0.9, yearsAgo);
    
    boxOfficeMetrics.globalRevenue += revenueImpact * recencyMultiplier;
    boxOfficeMetrics.leadRolePerformance += isLeadRole ? revenueImpact * 1.5 : revenueImpact;
    
    if (movie.genre_ids) {
      movie.genre_ids.forEach(genreId => {
        boxOfficeMetrics.genreSpecificSuccess += revenueImpact * 0.5;
      });
    }
  });

  return {
    recentBoxOffice: boxOfficeMetrics,
    marketAppeal: {
      domestic: Math.min(boxOfficeMetrics.globalRevenue * 0.4, 5),
      international: Math.min(boxOfficeMetrics.globalRevenue * 0.6, 5),
      genreSpecific: {}
    },
    genrePerformance: {}
  };
}

// Project Value Calculations
export function calculateProjectValue(
  budget: number,
  genre: string,
  cast: any[],
  territory: string,
  region: string
): { ask: number; take: number } {
  const territoryData = marketMultipliers.territories[region]?.[territory];
  if (!territoryData) return { ask: 0, take: 0 };

  // Get budget tier multiplier
  const budgetTier = Object.values(marketMultipliers.budgetTiers).find(
    tier => budget >= tier.min && budget <= tier.max
  ) || marketMultipliers.budgetTiers.indie;

  // Calculate cast value
  const castValue = cast.reduce((acc, actor) => {
    const actorValue = actor.valueMetrics?.globalValue || 1;
    const territorySpecificValue = actor.valueMetrics?.territoryValues?.[region] || 1;
    return acc + (actorValue * territorySpecificValue);
  }, 1) / Math.max(cast.length, 1);

  // Calculate genre impact
  const genreMultiplier = territoryData.genreFactors?.[genre.toLowerCase()] || 1;

  // Final calculations
  const baseValue = budget * territoryData.baseMultiplier * budgetTier.multiplier;
  const adjustedValue = baseValue * castValue * genreMultiplier;

  return {
    ask: Math.round(adjustedValue),
    take: Math.round(adjustedValue * territoryData.takeRate)
  };
}

// Helper Functions
function calculateTerritoryValues(boxOfficeMetrics: any): Record<string, number> {
  const territoryValues = {};
  Object.keys(marketRegions).forEach(region => {
    territoryValues[region] = Math.min(
      (boxOfficeMetrics.recentBoxOffice.territoryStrength[region] || 1) * 
      (boxOfficeMetrics.marketAppeal.international || 1),
      5
    );
  });
  return territoryValues;
}