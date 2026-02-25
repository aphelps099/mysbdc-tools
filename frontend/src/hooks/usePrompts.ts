'use client';

import { useState, useEffect } from 'react';
import { fetchPrompts } from '@/lib/api';
import type { PromptItem, PromptCategory } from '@/lib/api';

export function usePrompts() {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [categories, setCategories] = useState<PromptCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchPrompts();
        if (cancelled) return;
        setPrompts(data.prompts);
        setCategories(data.categories);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load prompts');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { prompts, categories, loading, error };
}
