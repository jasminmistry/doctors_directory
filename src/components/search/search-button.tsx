"use client";

import { IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface SearchButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

export function SearchButton({ isLoading, onClick }: SearchButtonProps) {
  return (
    <div className='flex'>
      <Button
        onClick={onClick}
        size="lg"
        className="ml-4 h-12 w-12 sm:h-12.5 sm:w-12 rounded-lg bg-black !text-white hover:cursor-pointer hover:bg-neutral-800 transition-colors flex items-center justify-center flex-shrink-0"
      >
        {isLoading ? (
          <IconLoader2 stroke={1.5} className="h-6 w-6 animate-spin !text-white" color="white" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-6 w-6"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        )}
      </Button>
    </div>
  );
}
