import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import api from "@/api";

export default function SearchResults() {
  const router = useRouter();
  const { query } = router.query; // Get the search query from the URL
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      const fetchResults = async () => {
        try {
          const response = await api.get(`/search?query=${query}`);
          setResults(response.data); // Assuming the API returns search results
        } catch (error) {
          console.error("Error fetching search results:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchResults();
    }
  }, [query]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Search Results for "{query}"</h1>
      {results.length > 0 ? (
        <ul className="space-y-4">
          {results.map((result, index) => (
            <li key={index} className="p-4 bg-white shadow rounded">
              <h2 className="text-lg font-semibold">{result.title}</h2>
              <p className="text-gray-600">{result.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
}
