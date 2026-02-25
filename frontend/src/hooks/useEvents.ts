'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchEvents } from '@/lib/api';
import type { EventItem } from '@/lib/api';

const PER_PAGE = 5;
const CACHE_KEY = 'sbdc_events_cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface CachedEvents {
  events: EventItem[];
  total: number;
  ts: number;
}

function readCache(): CachedEvents | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CachedEvents = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(events: EventItem[], total: number) {
  try {
    const data: CachedEvents = { events, total, ts: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Storage full — ignore
  }
}

export interface UseEventsReturn {
  events: EventItem[];
  page: number;
  totalPages: number;
  total: number;
  loading: boolean;
  error: string | null;
  goToPage: (p: number) => void;
}

/**
 * Shows cached events instantly, then fetches all events in a single
 * bulk request in the background. Pagination is purely client-side.
 */
export function useEvents(): UseEventsReturn {
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    // 1. Load from localStorage cache instantly
    const cached = readCache();
    if (cached) {
      setAllEvents(cached.events);
      setTotal(cached.total);
      setLoading(false);
    }

    // 2. Fetch all events in one bulk request (background refresh)
    (async () => {
      if (!cached) setLoading(true);
      setError(null);
      try {
        // Single request: get all events at once (per_page=200)
        const res = await fetchEvents(1, 200);
        setAllEvents(res.events);
        setTotal(res.total);
        writeCache(res.events, res.total);
      } catch {
        if (!cached) setError('Unable to load events. Try again later.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Use the API total so pagination shows immediately
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  // Slice the current page from the locally-cached array
  const start = (page - 1) * PER_PAGE;
  const events = allEvents.slice(start, start + PER_PAGE);

  const goToPage = useCallback(
    (p: number) => {
      if (p >= 1 && p <= totalPages) setPage(p);
    },
    [totalPages],
  );

  return { events, page, totalPages, total, loading, error, goToPage };
}
