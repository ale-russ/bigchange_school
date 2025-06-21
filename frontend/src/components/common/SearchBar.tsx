import React from 'react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <div className="mb-4">
      <Input
        type="text"
        placeholder="Search by name, address, class, or parent..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-full max-w-md"
      />
    </div>
  );
}