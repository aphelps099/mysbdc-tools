'use client';

import SearchInput from '../ui/SearchInput';

interface PromptSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
  variant?: 'light' | 'dark';
}

export default function PromptSearch({ value, onChange, resultCount, variant = 'dark' }: PromptSearchProps) {
  return (
    <SearchInput
      value={value}
      onChange={onChange}
      placeholder="Search by name, keyword, or category..."
      resultCount={resultCount}
      variant={variant}
    />
  );
}
