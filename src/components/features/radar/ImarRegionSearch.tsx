"use client";

import { Loader2, MapPin, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  POPULAR_IMAR_REGIONS,
  formatRegionLabel,
} from "@/lib/radar/imar-radar-config";
import { cn } from "@/lib/utils";

export type ImarRegionOption = {
  label: string;
  lat?: number;
  lng?: number;
};

type ImarRegionSearchProps = {
  value: string;
  onChange: (region: ImarRegionOption) => void;
  disabled?: boolean;
};

export function ImarRegionSearch({
  value,
  onChange,
  disabled,
}: ImarRegionSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ImarRegionOption[]>([]);
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
          data?: { lat: number; lng: number; label: string }[];
          error?: string;
        };

        if (!response.ok) {
          setResults([]);
          setError(payload.error ?? "Konum aranamadı.");
          setIsOpen(true);
          return;
        }

        setResults(
          (payload.data ?? []).map((item) => ({
            label: formatRegionLabel(item.label),
            lat: item.lat,
            lng: item.lng,
          })),
        );
        setIsOpen(true);
      } catch {
        setResults([]);
        setError("Bağlantı hatası.");
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function handleSelect(region: ImarRegionOption) {
    onChange(region);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setError(null);
  }

  return (
    <div ref={containerRef} className="space-y-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.5}
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => (results.length > 0 || error) && setIsOpen(true)}
          placeholder="İl, ilçe veya mahalle ara..."
          disabled={disabled}
          className="border-border/60 bg-muted/20 pl-9"
          autoComplete="off"
        />
        {isLoading ? (
          <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground/90"
            aria-label="Aramayı temizle"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
        <MapPin className="size-4 shrink-0 text-primary" strokeWidth={1.75} />
        <span className="min-w-0 truncate text-sm font-medium text-foreground">
          {value}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {POPULAR_IMAR_REGIONS.map((region) => (
          <Button
            key={region.label}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => handleSelect({ label: region.label })}
            className={cn(
              "h-7 rounded-full px-2.5 text-[11px]",
              value === region.label && "border-primary/30 bg-primary/10",
            )}
          >
            {region.label}
          </Button>
        ))}
      </div>

      {isOpen ? (
        <ul className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg">
          {error ? (
            <li className="px-3 py-2.5 text-xs text-muted-foreground">{error}</li>
          ) : results.length === 0 && !isLoading ? (
            <li className="px-3 py-2.5 text-xs text-muted-foreground">Sonuç bulunamadı.</li>
          ) : (
            results.map((result, index) => (
              <li key={`${result.label}-${index}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(result)}
                  className={cn(
                    "flex w-full items-start gap-2 px-3 py-2.5 text-left text-xs text-foreground/90 transition-colors hover:bg-muted/40",
                    index > 0 && "border-t border-border/40",
                  )}
                >
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  <span className="line-clamp-2">{result.label}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
