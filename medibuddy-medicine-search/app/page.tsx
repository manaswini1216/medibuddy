"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MedicineCard from "@/components/MedicineCard";
import { searchMedicines } from "@/lib/api";

type Medicine = {
  openfda?: {
    spl_set_id?: string[];
    brand_name?: string[];
    generic_name?: string[];
    manufacturer_name?: string[];
    product_type?: string[];
    route?: string[];
  };
};

const MAX_RECENT_SEARCHES = 5;

export default function Home() {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [query, setQuery] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");

    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowRecent(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const saveRecentSearch = (value: string) => {
    const updated = [
      value,
      ...recentSearches.filter(
        (item) => item.toLowerCase() !== value.toLowerCase()
      ),
    ].slice(0, MAX_RECENT_SEARCHES);

    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSearch = async (
    e?: React.FormEvent,
    value?: string
  ) => {
    e?.preventDefault();

    const searchValue = (value ?? query).trim();

    if (!searchValue) return;

    // Cancel the previous request before starting a new one.
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setQuery(searchValue);
    setShowRecent(false);
    setLoading(true);
    setError("");
    setSearched(true);

    saveRecentSearch(searchValue);

    try {
      const results = await searchMedicines(
        searchValue,
        controller.signal
      );

      setMedicines(results);

      sessionStorage.setItem(
        "medicines",
        JSON.stringify(results)
      );

      sessionStorage.setItem(
        "searchQuery",
        searchValue
      );
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      setMedicines([]);
      setError("Unable to fetch medicines. Please try again.");
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const removeRecentSearch = (value: string) => {
    const updated = recentSearches.filter(
      (item) => item !== value
    );

    setRecentSearches(updated);

    localStorage.setItem(
      "recentSearches",
      JSON.stringify(updated)
    );
  };

  const handleMedicineClick = (medicine: Medicine) => {
  const id = medicine.openfda?.spl_set_id?.[0];

  if (!id) {
    return;
  }

  router.push(
    `/medicine/${encodeURIComponent(id)}`
  );
};
  return (
    <main>
      <div className="hero-text">
  <h1>Know your medicine,<br />before you take it.</h1>
  <p>Search medicines by brand name or active ingredient.</p>
</div>

      <div className="search-wrapper" ref={searchRef}>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search medicine by brand name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowRecent(true)}
            autoComplete="off"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {showRecent && recentSearches.length > 0 && (
          <div className="recent-searches">
            <div className="recent-header">
              <span>Recent searches</span>

              <button
                type="button"
                onClick={() => {
                  setRecentSearches([]);
                  localStorage.removeItem("recentSearches");
                }}
              >
                Clear
              </button>
            </div>

            {recentSearches.map((search) => (
              <div className="recent-item" key={search}>
                <button
                  type="button"
                  onClick={() =>
                    handleSearch(undefined, search)
                  }
                >
                  ↻ {search}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    removeRecentSearch(search)
                  }
                  aria-label={`Remove ${search}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <section className="results">
        {loading && (
          <p className="status">
            Searching medicines...
          </p>
        )}

        {!loading && error && (
          <p className="status error">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          searched &&
          medicines.length === 0 && (
            <p className="status">
              No results found for "{query}".
            </p>
          )}

        {!loading &&
          !error &&
          medicines.length > 0 && (
            <>
              <p className="result-count">
                {medicines.length} medicine
                {medicines.length !== 1 ? "s" : ""} found
              </p>

              <div className="medicine-grid">
                {medicines.map((medicine) => (
                  <MedicineCard
                    key={medicine.openfda?.spl_set_id?.[0]}
                    medicine={medicine}
                    onClick={() => handleMedicineClick(medicine)}
                  />
                ))}
              </div>
            </>
          )}
      </section>
    </main>
  );
}

