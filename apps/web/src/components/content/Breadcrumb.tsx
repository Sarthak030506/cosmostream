'use client';

import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href: string;
  emoji?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          {index > 0 && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {index === items.length - 1 ? (
            // Last item - not clickable
            <span className="text-white flex items-center gap-1">
              {item.emoji && <span>{item.emoji}</span>}
              <span>{item.label}</span>
            </span>
          ) : (
            // Clickable items
            <Link
              href={item.href}
              className="hover:text-white transition flex items-center gap-1"
            >
              {item.emoji && <span>{item.emoji}</span>}
              <span>{item.label}</span>
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
