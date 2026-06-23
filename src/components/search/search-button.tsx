"use client";

import { Loader2, Search } from "lucide-react";
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
        className="ml-4 h-12 w-12 sm:h-12.5 sm:w-12 rounded-full hover:cursor-pointer rounded-lg text-white hover:bg-gray-800 transition-colors flex items-center justify-center flex-shrink-0"
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <Search className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}