"use client";

const BASE_URL = "https://api.themoviedb.org/3";

export async function searchPerson(query: string) {
  if (!query || query.length < 2) return null;
  
  const response = await fetch(
    `${BASE_URL}/search/person?query=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
  
  if (!response.ok) {
    console.error('TMDB API Error:', {
      status: response.status,
      statusText: response.statusText,
      query: query
    });
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('TMDB response:', data); // Debug
  return data;
}