"use client";

const BASE_URL = "https://api.themoviedb.org/3";
const TOKEN = process.env.NEXT_PUBLIC_TMDB_TOKEN;

const fetchTMDB = async (endpoint: string) => {
  console.log("Fetching from TMDB:", `${BASE_URL}${endpoint}`);
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("TMDB Response:", data);
    return data;
  } catch (error) {
    console.error("TMDB API Error:", error);
    throw error;
  }
};

export async function searchPerson(query: string) {
  console.log("Searching for:", query);
  if (!query || query.length < 2) return null;
  return fetchTMDB(`/search/person?query=${encodeURIComponent(query)}`);
}
