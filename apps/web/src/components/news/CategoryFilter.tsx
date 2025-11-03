"use client";

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from "@/components/ui/drawer";

interface CategoryFilterProps {
  categories: Array<{ value: string; label: string }>;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categoryCounts?: Record<string, number>;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  categoryCounts,
}: CategoryFilterProps) {
  const DesktopCategoryFilter = () => (
    <div className="hidden md:flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onCategoryChange(cat.value)}
          className={`h-8 flex items-center px-1 pl-3 rounded-lg cursor-pointer border text-sm transition-colors ${
            selectedCategory === cat.value
              ? "border-cosmos-500 bg-cosmos-600 text-white"
              : "border-gray-700 text-gray-300 hover:bg-gray-800"
          }`}
        >
          <span>{cat.label}</span>
          {categoryCounts?.[cat.value] !== undefined && (
            <span
              className={`ml-2 text-xs border rounded-md h-6 min-w-6 font-medium flex items-center justify-center ${
                selectedCategory === cat.value
                  ? "border-cosmos-400 bg-gray-900 text-cosmos-300"
                  : "border-gray-700 text-gray-400"
              }`}
            >
              {categoryCounts[cat.value]}
            </span>
          )}
        </button>
      ))}
    </div>
  );

  const MobileCategoryFilter = () => (
    <Drawer>
      <DrawerTrigger className="md:hidden w-full flex items-center justify-between px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
        <span className="text-sm font-medium text-white">
          {categories.find((c) => c.value === selectedCategory)?.label ||
            "Select Category"}
        </span>
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </DrawerTrigger>

      <DrawerContent className="md:hidden">
        <DrawerHeader>
          <h3 className="font-semibold text-sm text-white">Select Category</h3>
        </DrawerHeader>

        <DrawerBody>
          <div className="space-y-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => onCategoryChange(cat.value)}
                className="w-full flex items-center justify-between font-medium cursor-pointer text-sm transition-colors"
              >
                <span
                  className={`w-full flex items-center justify-between font-medium cursor-pointer text-sm transition-colors ${
                    selectedCategory === cat.value
                      ? "underline underline-offset-4 text-cosmos-400"
                      : "text-gray-300"
                  }`}
                >
                  {cat.label}
                </span>
                {categoryCounts?.[cat.value] !== undefined && (
                  <span className="flex-shrink-0 ml-2 border border-gray-700 rounded-md h-6 min-w-6 flex items-center justify-center text-gray-400">
                    {categoryCounts[cat.value]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );

  return (
    <>
      <DesktopCategoryFilter />
      <MobileCategoryFilter />
    </>
  );
}
