"use client";

export const territoryMultipliers = {
  northAmerica: {
    usa: {
      name: "USA",
      baseMultiplier: 0.5,
      takeRate: 0.6
    },
    canada: {
      name: "Canada",
      baseMultiplier: 0.07,
      takeRate: 0.5
    }
  },
  europe: {
    uk: {
      name: "United Kingdom",
      baseMultiplier: 0.15,
      takeRate: 0.5
    },
    france: {
      name: "France",
      baseMultiplier: 0.12,
      takeRate: 0.5
    },
    germany: {
      name: "Germany/Austria/Switzerland",
      baseMultiplier: 0.15,
      takeRate: 0.5
    },
    italy: {
      name: "Italy",
      baseMultiplier: 0.08,
      takeRate: 0.5
    },
    spain: {
      name: "Spain",
      baseMultiplier: 0.08,
      takeRate: 0.5
    },
    benelux: {
      name: "Benelux",
      baseMultiplier: 0.06,
      takeRate: 0.5
    },
    scandinavia: {
      name: "Scandinavia",
      baseMultiplier: 0.07,
      takeRate: 0.5
    }
  },
  asia: {
    china: {
      name: "China",
      baseMultiplier: 0.15,
      takeRate: 0.55
    },
    japan: {
      name: "Japan",
      baseMultiplier: 0.1,
      takeRate: 0.5
    },
    southKorea: {
      name: "South Korea",
      baseMultiplier: 0.08,
      takeRate: 0.5
    },
    panAsia: {
      name: "Pan Asia",
      baseMultiplier: 0.12,
      takeRate: 0.5
    }
  },
  latinAmerica: {
    panLatin: {
      name: "Pan Latin America",
      baseMultiplier: 0.15,
      takeRate: 0.5
    }
  },
  other: {
    australia: {
      name: "Australia/New Zealand",
      baseMultiplier: 0.06,
      takeRate: 0.5
    },
    middleEast: {
      name: "Middle East",
      baseMultiplier: 0.08,
      takeRate: 0.5
    },
    airlines: {
      name: "Airlines",
      baseMultiplier: 0.03,
      takeRate: 0.5
    }
  }
};

export const genreMultipliers = {
  action: 1.2,
  drama: 0.8,
  comedy: 1.0,
  horror: 1.1,
  thriller: 0.9,
  sciFi: 1.3,
  family: 1.1,
  documentary: 0.6
};
