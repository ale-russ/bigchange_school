"use client";

import { LucideAArrowDown, LucideArrowDown, LucideArrowUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface MultiSelectCheckboxProps {
  options: { id: string; label: string }[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
  itemName?: string;
  disabled?: boolean;
  isClass?: boolean;
}
export default function MultiSelectCheckbox({
  options,
  selectedIds,
  onChange,
  placeholder = "Select options",
  disabled = false,
  itemName = "Items",
  isClass = false,
}: MultiSelectCheckboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheckboxChange = (id: string) => {
    const newSelectedIds = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];
    onChange(newSelectedIds);
  };

  const selectedLabels =
    selectedIds.length === 0
      ? `No ${itemName}`
      : !isClass
      ? `${selectedIds.length} ${itemName}${
          selectedIds.length !== 1 ? "s" : ""
        }`
      : `${itemName}`;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="mt-1 flex items-center justify-between w-full p-3 border border-gray-300 rounded-md bg-white text-left text-gray-700 focus:ring-blue-500 focus:border-blue-500"
      >
        {selectedLabels}
        {isOpen ? (
          // <div className="rounded-full border border-gray-300">
          <LucideArrowUp width={16} height={14} />
        ) : (
          // </div>
          // <div className="rounded-full border border-gray-300">
          <LucideArrowDown width={16} height={14} />
          // </div>
        )}
      </button>
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto transition-all duration-200 ease-in-out">
          {options.length === 0 ? (
            <p className="p-3 text-gray-500">No options available</p>
          ) : (
            options.map((option) => (
              <label
                key={option.id}
                className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(option.id)}
                  onChange={() => handleCheckboxChange(option.id)}
                  disabled={disabled}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700">{option.label}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}
