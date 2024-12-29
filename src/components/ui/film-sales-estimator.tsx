"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Download } from "lucide-react";
import { ActorSearch } from "./actor-search";
import CinelaunchNav from "./cinelaunch-nav";
import { exportToExcel } from "@/lib/export-utils";
import { exportToPDF } from '@/lib/pdfExport';
import { 
  calculateProjectValue, 
  calculateActorMarketValue, 
  marketMultipliers,
  marketRegions 
} from "@/lib/salesCalculations";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from "recharts";

// Types and Interfaces
interface ValidationState {
  title: boolean;
  budget: boolean;
  genre: boolean;
  director: boolean;
}

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

interface ProjectDetails {
  title: string;
  budget: string;
  genre: string;
  director: string;
  cast: any[];
}

interface LoadingState {
  actorSearch: boolean;
  estimation: boolean;
}

// Constants
const VALID_GENRES = [
  'action', 'drama', 'comedy', 'thriller', 'horror', 
  'family', 'sciFi', 'adventure', 'romance', 'documentary'
];

// Helper Components
const InfoTooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && (
        <div className="absolute z-50 p-2 bg-white rounded shadow-lg border text-sm w-64 mt-1">
          {content}
        </div>
      )}
    </div>
  );
};

const GenreSuggestions: React.FC<{ 
  input: string; 
  onSelect: (genre: string) => void 
}> = ({ input, onSelect }) => {
  if (!input) return null;
  
  const suggestions = VALID_GENRES.filter(genre => 
    genre.toLowerCase().includes(input.toLowerCase())
  );
  
  if (suggestions.length === 0) return null;
  
  return (
    <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg">
      {suggestions.map(genre => (
        <div
          key={genre}
          className="px-4 py-2 hover:bg-slate-50 cursor-pointer capitalize"
          onClick={() => onSelect(genre)}
        >
          {genre}
        </div>
      ))}
    </div>
  );
};

// Main Component
export function FilmSalesEstimator() {
  // State Management
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    title: "",
    budget: "",
    genre: "",
    director: "",
    cast: []
  });

  const [estimates, setEstimates] = useState<any>(null);
  const [actorAnalytics, setActorAnalytics] = useState<any[]>([]);
  const [marketStrength, setMarketStrength] = useState<any>({});
  const [loading, setLoading] = useState<LoadingState>({
    actorSearch: false,
    estimation: false
  });
  const [validation, setValidation] = useState<ValidationState>({
    title: true,
    budget: true,
    genre: true,
    director: true
  });
  const [error, setError] = useState<string | null>(null);

  // Validation Functions
  const validateInputs = (): boolean => {
    const newValidation = {
      title: projectDetails.title.length > 0,
      budget: parseFloat(projectDetails.budget) > 0,
      genre: VALID_GENRES.includes(projectDetails.genre.toLowerCase()),
      director: projectDetails.director.length > 0
    };
    
    setValidation(newValidation);
    return Object.values(newValidation).every(v => v);
  };

  // Event Handlers
  const handleActorSelect = async (actor: any) => {
    try {
      setLoading(prev => ({ ...prev, actorSearch: true }));
      const actorValue = await calculateActorMarketValue(actor);
      const enhancedActor = {
        ...actor,
        valueMetrics: actorValue
      };

      setProjectDetails(prev => ({
        ...prev,
        cast: [...prev.cast, enhancedActor]
      }));

      updateActorAnalytics([...projectDetails.cast, enhancedActor]);
      setError(null);
    } catch (err) {
      setError("Failed to analyze actor's market value. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, actorSearch: false }));
    }
  };

  const removeActor = (index: number) => {
    const newCast = [...projectDetails.cast];
    newCast.splice(index, 1);
    setProjectDetails(prev => ({ ...prev, cast: newCast }));
    updateActorAnalytics(newCast);
  };

  const updateActorAnalytics = (cast: any[]) => {
    const analytics = cast.map(actor => ({
      name: actor.name,
      baseValue: actor.valueMetrics?.globalValue || 1,
      marketImpact: Object.values(actor.valueMetrics?.territoryValues || {})
        .reduce((acc: number, val: number) => acc + val, 0) / 5,
      genreStrength: Object.keys(actor.valueMetrics?.genreStrength || {}).length || 0
    }));
    setActorAnalytics(analytics);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) {
      setError("Please fill in all required fields correctly.");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, estimation: true }));
      await calculateEstimates();
      setError(null);
    } catch (err) {
      setError("Failed to generate estimates. Please check your inputs and try again.");
    } finally {
      setLoading(prev => ({ ...prev, estimation: false }));
    }
  };

  const calculateEstimates = async () => {
    const budget = parseFloat(projectDetails.budget);
    if (!budget) return;

    let estimates = {};
    let totalAsk = 0;
    let totalTake = 0;
    let marketStrengthData = {};

    Object.entries(marketMultipliers.territories).forEach(([region, territories]) => {
      estimates[region] = {
        territories: {},
        totalAsk: 0,
        totalTake: 0
      };

      marketStrengthData[region] = {
        castStrength: 0,
        genreImpact: 0,
        marketPotential: 0
      };

      Object.entries(territories).forEach(([territory, territoryData]) => {
        const { ask, take } = calculateProjectValue(
          budget,
          projectDetails.genre,
          projectDetails.cast,
          territory,
          region
        );

        estimates[region].territories[territory] = { ask, take };
        estimates[region].totalAsk += ask;
        estimates[region].totalTake += take;
        totalAsk += ask;
        totalTake += take;

        const castStrength = projectDetails.cast.reduce((acc, actor) => 
          acc + (actor.valueMetrics?.territoryValues?.[region] || 1), 0);
        
        marketStrengthData[region].castStrength = castStrength;
        marketStrengthData[region].genreImpact = 
          territoryData.genreFactors?.[projectDetails.genre.toLowerCase()] || 1;
        marketStrengthData[region].marketPotential = 
          (castStrength * marketStrengthData[region].genreImpact);
      });
    });

    setEstimates({
      regions: estimates,
      total: {
        ask: Math.round(totalAsk),
        take: Math.round(totalTake)
      }
    });
    setMarketStrength(marketStrengthData);
  };

  // Render Function
  return (
    <>
      <CinelaunchNav />
      <div className="max-w-6xl mx-auto p-4">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {estimates && (
          <div className="mb-4 flex gap-2">
            <Button 
              onClick={() => exportToExcel(estimates, projectDetails)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
            <Button 
              onClick={() => exportToPDF(estimates, projectDetails)}
              className="flex items-center gap-2"
              variant="secondary"
            >
              <Download className="h-4 w-4" />
              Export to PDF
            </Button>
          </div>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Film Sales Estimator</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Title Input */}
                <div>
                  <Label htmlFor="title">
                    <InfoTooltip content="Enter your project's title. This will be used for report generation.">
                      Project Title *
                    </InfoTooltip>
                  </Label>
                  <Input
                    id="title"
                    value={projectDetails.title}
                    onChange={(e) =>
                      setProjectDetails({ ...projectDetails, title: e.target.value })
                    }
                    className={`mt-2 ${!validation.title ? 'border-red-500' : ''}`}
                  />
                </div>

                {/* Budget Input */}
                <div>
                  <Label htmlFor="budget">
                    <InfoTooltip content="Enter the total budget in USD. This is used to calculate territory-specific estimates.">
                      Budget (USD) *
                    </InfoTooltip>
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    value={projectDetails.budget}
                    onChange={(e) =>
                      setProjectDetails({ ...projectDetails, budget: e.target.value })
                    }
                    className={`mt-2 ${!validation.budget ? 'border-red-500' : ''}`}
                  />
                </div>

                {/* Genre Input */}
                <div className="relative">
                  <Label htmlFor="genre">
                    <InfoTooltip content="Select a genre. Different genres perform differently in various territories.">
                      Genre *
                    </InfoTooltip>
                  </Label>
                  <Input
                    id="genre"
                    value={projectDetails.genre}
                    onChange={(e) =>
                      setProjectDetails({ ...projectDetails, genre: e.target.value })
                    }
                    className={`mt-2 ${!validation.genre ? 'border-red-500' : ''}`}
                  />
                  <GenreSuggestions 
                    input={projectDetails.genre}
                    onSelect={(genre) => setProjectDetails(prev => ({ ...prev, genre }))}
                  />
                </div>

                {/* Director Input */}
                <div>
                  <Label htmlFor="director">
                    <InfoTooltip content="Enter the director's name. This can impact territory valuations.">
                      Director *
                    </InfoTooltip>
                  </Label>
                  <Input
                    id="director"
                    value={projectDetails.director}
                    onChange={(e) =>
                      setProjectDetails({ ...projectDetails, director: e.target.value })
                    }
                    className={`mt-2 ${!validation.director ? 'border-red-500' : ''}`}
                  />
                </div>
              </div>

              {/* Cast Members Section */}
              <div>
                <Label>
                  <InfoTooltip content="Add cast members to calculate their impact on territory values.">
                    Cast Members
                  </InfoTooltip>
                </Label>
                <div className="space-y-4 mt-2">
                  <ActorSearch onSelect={handleActorSelect} />
                  
                  {loading.actorSearch && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                    </div>
                  )}
                  
                  {projectDetails.cast.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {projectDetails.cast.map((actor, index) => (
                        <div key={actor.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {actor.profile_path && (
                              <img
                                src={`https://image.tmdb.org/t/p/w45${actor.profile_path}`}
                                alt={actor.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium">{actor.name}</div>
                              {actor.known_for?.[0]?.title && (
                                <div className="text-sm text-slate-500">
                                  Known for: {actor.known_for[0].title}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeActor(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full mt-6"
                disabled={loading.estimation}
              >
                {loading.estimation ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Estimates...
                  </div>
                ) : (
                  "Generate Estimates"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Analytics Section */}
        {actorAnalytics.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Cast Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={actorAnalytics}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="baseValue" fill="#8884d8" name="Star Power" />
                    <Bar dataKey="marketImpact" fill="#82ca9d" name="Market Impact" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Market Strength Analysis */}
        {estimates && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Market Strength Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(marketStrength).map(([region, metrics]) => (
                    <div key={region} className="p-4 border rounded-lg">
                      <h3 className="font-medium capitalize mb-2">{region}</h3>
                      <div className="space-y-2">
                        <InfoTooltip content="Combined star power impact in this territory">
                          <div className="flex justify-between">
                            <span>Cast Strength:</span>
                            <span className="font-medium">
                              {(metrics.castStrength).toFixed(2)}x
                            </span>
                          </div>
                        </InfoTooltip>
                        <InfoTooltip content="Genre performance modifier for this territory">
                          <div className="flex justify-between">
                            <span>Genre Impact:</span>
                            <span className="font-medium">
                              {metrics.genreImpact.toFixed(2)}x
                            </span>
                          </div>
                        </InfoTooltip>
                        <InfoTooltip content="Overall market potential combining cast and genre factors">
                          <div className="flex justify-between text-primary font-medium">
                            <span>Market Potential:</span>
                            <span>{metrics.marketPotential.toFixed(2)}x</span>
                          </div>
                        </InfoTooltip>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sales Estimates Table */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Estimates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left p-2 border">Territory</th>
                        <th className="text-right p-2 border">Ask Price (USD)</th>
                        <th className="text-right p-2 border">Take Price (USD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(estimates.regions).map(([regionKey, region]) => (
                        <React.Fragment key={regionKey}>
                          <tr className="bg-slate-50">
                            <td colSpan={3} className="font-bold p-2 border capitalize">
                              {regionKey}
                            </td>
                          </tr>
                          {Object.entries(region.territories).map(([territoryKey, territory]) => (
                            <tr key={territoryKey}>
                              <td className="p-2 border pl-4 capitalize">
                                <InfoTooltip content={`Based on market data and historical performance in ${territoryKey}`}>
                                  {territoryKey}
                                </InfoTooltip>
                              </td>
                              <td className="text-right p-2 border">
                                ${territory.ask.toLocaleString()}
                              </td>
                              <td className="text-right p-2 border">
                                ${territory.take.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-slate-100">
                            <td className="p-2 border font-medium">Region Total</td>
                            <td className="text-right p-2 border font-medium">
                              ${Math.round(region.totalAsk).toLocaleString()}
                            </td>
                            <td className="text-right p-2 border font-medium">
                              ${Math.round(region.totalTake).toLocaleString()}
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                      <tr className="bg-slate-800 text-white">
                        <td className="p-2 border font-bold">TOTAL WORLDWIDE</td>
                        <td className="text-right p-2 border font-bold">
                          ${estimates.total.ask.toLocaleString()}
                        </td>
                        <td className="text-right p-2 border font-bold">
                          ${estimates.total.take.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}