"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SearchResult = {
  title: string;
  description: string;
  href: string;
  section: string;
  content: string;
};

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<SearchResult[]>([]);
  const normalized = query.trim().toLowerCase();

  useEffect(() => {
    fetch("/api/search")
      .then((response) => response.json())
      .then((payload) => setDocs(payload.results ?? []))
      .catch(() => setDocs([]));
  }, []);

  const results = useMemo(() => {
    if (normalized.length < 2) return [];
    return docs
      .map((item) => {
        const haystack = `${item.title} ${item.description} ${item.section} ${item.content}`.toLowerCase();
        const score = (item.title.toLowerCase().includes(normalized) ? 4 : 0) +
          (item.description.toLowerCase().includes(normalized) ? 2 : 0) +
          (haystack.includes(normalized) ? 1 : 0);
        return { ...item, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
      .slice(0, 8);
  }, [docs, normalized]);

  return (
    <div className="search-shell">
      <Search aria-hidden="true" size={17} />
      <input
        aria-label="Search documentation"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search docs"
      />
      {results.length > 0 && (
        <div className="search-results">
          {results.map((result) => (
            <Link key={result.href} href={result.href} onClick={() => setQuery("")}>
              <strong>{result.title}</strong>
              <span>{result.description || result.section}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
