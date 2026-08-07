"use client";

import { IconLoader2, IconSearch } from "@tabler/icons-react";
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
        className="ml-4 h-12 w-12 sm:h-12.5 sm:w-12 rounded-full hover:cursor-pointer rounded-lg text-white hover:bg-neutral-800 transition-colors flex items-center justify-center flex-shrink-0"
      >
        {isLoading ? (
          <IconLoader2 stroke={1.5} className="h-6 w-6 animate-spin" />
        ) : (
          <IconSearch stroke={1.5} className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}