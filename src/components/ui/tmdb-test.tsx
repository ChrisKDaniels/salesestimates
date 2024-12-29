"use client";

import React, { useState } from "react";
import { Button } from "./button";
import { searchPerson } from "@/lib/tmdb";

export function TMDBTest() {
  const [results, setResults] = useState(null);

  const testAPI = async () => {
    try {
      const data = await searchPerson("Tom Cruise");
      setResults(data);
      console.log("Search Results:", data);
    } catch (error) {
      console.error("Test failed:", error);
    }
  };

  return (
    <div className="p-4">
      <Button onClick={testAPI}>Test TMDB API</Button>
      {results && (
        <pre className="mt-4 p-4 bg-gray-100 rounded">
          {JSON.stringify(results, null, 2)}
        </pre>
      )}
    </div>
  );
}
