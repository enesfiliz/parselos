"use client";

import { Loader2, MapPin, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type GeocodeResult = {
  lat: number;
  lng: number;
  label: string;
  type: string | null;
};

type RadarGeocodeSearchProps = {
  onSelect: (result: GeocodeResult) => void;
};

export function RadarGeocodeSearch({ onSelect }: RadarGeocodeSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      debounceRef.current = setTimeout(() => {
        setResults([]);
        setIsOpen(false);
        setError(null);
      }, 0);

      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/geocode?q=${encodeURIComponent(trimmed)}`,
        );
        const payload = (await response.json()) as {
          data?: GeocodeResult[];
          error?: string;
        };

        if (!response.ok) {
          setResults([]);
          setError(payload.error ?? "Arama başarısız.");
          setIsOpen(true);
          return;
        }

        setResults(payload.data ?? []);
        setIsOpen(true);
      } catch {
        setResults([]);
        setError("Bağlantı hatası.");
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 420);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSelect(result: GeocodeResult) {
    onSelect(result);
    setQuery(result.label.split(",").slice(0, 2).join(", "));
    setIsOpen(false);
    setResults([]);
  }

  return (
    <div
      ref={containerRef}
      className="pointer-events-auto absolute top-4 right-4 z-[1000] w-96 max-w-[calc(100%-2rem)]"
    >
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-[#151f23]/90 px-6 py-3 shadow-2xl backdrop-blur-xl">
        {isLoading ? (
          <Loader2
            className="size-4 shrink-0 animate-spin text-[#b38c56]"
            strokeWidth={1.5}
          />
        ) : (
          <Search className="size-4 shrink-0 text-zinc-500" strokeWidth={1.25} />
        )}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => (results.length > 0 || error) && setIsOpen(true)}
          placeholder="İl, İlçe, Mahalle veya Ada/Parsel ara..."
          className="min-w-0 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
          autoComplete="off"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
              setError(null);
            }}
            className="text-zinc-500 transition-colors hover:text-zinc-300"
            aria-label="Aramayı temizle"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      {isOpen ? (
        <ul className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#151f23]/95 shadow-2xl backdrop-blur-xl">
          {error ? (
            <li className="px-4 py-3 text-xs text-zinc-500">{error}</li>
          ) : results.length === 0 && !isLoading ? (
            <li className="px-4 py-3 text-xs text-zinc-500">Sonuç bulunamadı.</li>
          ) : (
            results.map((result, index) => (
              <li key={`${result.lat}-${result.lng}-${index}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(result)}
                  className={cn(
                    "flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]",
                    index > 0 && "border-t border-white/[0.05]",
                  )}
                >
                  <MapPin
                    className="mt-0.5 size-3.5 shrink-0 text-[#b38c56]"
                    strokeWidth={1.5}
                  />
                  <span className="line-clamp-2 text-xs leading-snug text-zinc-300">
                    {result.label}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
