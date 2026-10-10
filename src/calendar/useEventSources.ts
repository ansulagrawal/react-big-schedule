import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  CalendarEvent,
  DateRange,
  EventFeed,
  EventFetcher,
  EventSource,
  EventSourceInput,
  EventSourceObject,
} from './types';

interface Source {
  input: EventSourceInput;
  color?: string;
  textColor?: string;
}

const isWrapped = (s: EventSource): s is EventSourceObject =>
  typeof s === 'object' && !Array.isArray(s) && 'events' in s;

function normalize(src: EventSource): Source {
  if (isWrapped(src)) return { input: src.events, color: src.color, textColor: src.textColor };
  const feed = !Array.isArray(src) && typeof src === 'object' ? (src as EventFeed) : undefined;
  return { input: src, color: feed?.color, textColor: feed?.textColor };
}

const paint = (events: CalendarEvent[], { color, textColor }: Source): CalendarEvent[] =>
  color || textColor
    ? events.map(e => ({ ...e, color: e.color ?? color, textColor: e.textColor ?? textColor }))
    : events;

const resolve = <T>(v: T | (() => T) | undefined): T | undefined => (typeof v === 'function' ? (v as () => T)() : v);

async function fetchFeed(feed: EventFeed, range: DateRange, signal: AbortSignal): Promise<CalendarEvent[]> {
  const params = new URLSearchParams();
  const all = { ...resolve(feed.params), ...resolve(feed.extraParams) };
  for (const [k, v] of Object.entries(all)) params.set(k, String(v));
  params.set(feed.startParam ?? 'start', range.start.toISOString());
  params.set(feed.endParam ?? 'end', range.end.toISOString());
  const post = feed.method === 'POST';
  const url = post ? feed.url : `${feed.url}${feed.url.includes('?') ? '&' : '?'}${params}`;
  const res = await fetch(url, {
    method: feed.method ?? 'GET',
    headers: { ...(post ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}), ...feed.headers },
    body: post ? params : undefined,
    signal,
  });
  if (!res.ok) throw new Error(`Event feed ${feed.url} responded ${res.status}`);
  return (await res.json()) as CalendarEvent[];
}

const load = (src: Source, range: DateRange, signal: AbortSignal): Promise<CalendarEvent[]> =>
  Promise.resolve(
    typeof src.input === 'function'
      ? (src.input as EventFetcher)(range, signal)
      : fetchFeed(src.input as EventFeed, range, signal),
  );

export interface UseEventSources {
  events: CalendarEvent[];
  loading: boolean;
}

/**
 * Merge `events` + `eventSources` into one array. Arrays are used as is; function and feed sources are (re)fetched
 * whenever the visible range changes, and a request left behind by navigation is aborted and ignored.
 * Inline function sources do not refetch on re-render; feeds refetch when url/method change.
 */
export function useEventSources(
  events: EventSource | undefined,
  eventSources: EventSource[] | undefined,
  range: DateRange,
  onLoading?: (loading: boolean) => void,
  onError?: (error: Error) => void,
): UseEventSources {
  const list = useMemo(
    () => (events === undefined ? [] : [events]).concat(eventSources ?? []).map(normalize),
    [events, eventSources],
  );
  const latest = useRef({ list, onError });
  latest.current = { list, onError };
  // fetched results by source position; kept while a new range loads so the grid doesn't blink
  const [fetched, setFetched] = useState<Record<number, CalendarEvent[]>>({});
  const [loading, setLoading] = useState(false);
  const dynKey = list
    .map(s =>
      typeof s.input === 'function'
        ? 'fn'
        : Array.isArray(s.input)
          ? ''
          : JSON.stringify([s.input.url, s.input.method]),
    )
    .join('|');
  const from = range.start.valueOf();
  const to = range.end.valueOf();

  useEffect(() => {
    const dynamic = latest.current.list.flatMap((s, i) => (Array.isArray(s.input) ? [] : [{ s, i }]));
    if (!dynamic.length) {
      setLoading(false);
      return undefined;
    }
    const ctl = new AbortController();
    setLoading(true);
    Promise.all(
      dynamic.map(async ({ s, i }) => {
        try {
          const events = await load(s, range, ctl.signal);
          if (!ctl.signal.aborted) setFetched(f => ({ ...f, [i]: events }));
        } catch (err) {
          if (!ctl.signal.aborted) latest.current.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
      }),
    ).then(() => {
      if (!ctl.signal.aborted) setLoading(false);
    });
    return () => ctl.abort();
  }, [from, to, dynKey]);

  const lastLoading = useRef(false);
  useEffect(() => {
    if (lastLoading.current !== loading) {
      lastLoading.current = loading;
      onLoading?.(loading);
    }
  }, [loading, onLoading]);

  const merged = useMemo(
    () => list.flatMap((s, i) => paint(Array.isArray(s.input) ? s.input : (fetched[i] ?? []), s)),
    [list, fetched],
  );
  return { events: merged, loading };
}
