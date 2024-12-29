"use client";

import React, { useState, useCallback } from "react";
import { Input } from "./input";
import { Card, CardContent } from "./card";
import { searchPerson } from "@/lib/tmdb";
import { Loader2 } from "lucide-react";
import { debounce } from "lodash";

export function ActorSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(
    debounce(async (searchQuery) => {
      if (searchQuery.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await searchPerson(searchQuery);
        setResults(data?.results || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  return (
    <div className="relative">
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          placeholder="Search for an actor..."
          className="w-full"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          </div>
        )}
      </div>

      {results.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg">
          <CardContent className="p-0">
            <div className="max-h-[300px] overflow-y-auto">
              {results.map((person) => (
                <div
                  key={person.id}
                  className="p-3 hover:bg-slate-100 cursor-pointer border-b last:border-b-0 flex items-center gap-3"
                  onClick={() => {
                    onSelect(person);
                    setQuery("");
                    setResults([]);
                  }}
                >
                  {person.profile_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w45${person.profile_path}`}
                      alt={person.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium">{person.name}</div>
                    {person.known_for?.[0]?.title && (
                      <div className="text-sm text-slate-500">
                        Known for: {person.known_for[0].title}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
