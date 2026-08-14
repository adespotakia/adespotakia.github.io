
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface ForumSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: (e: React.FormEvent) => void;
}

export const ForumSearch: React.FC<ForumSearchProps> = ({
  searchTerm,
  setSearchTerm,
  handleSearch,
}) => {
  return (
    <form onSubmit={handleSearch} className="flex w-full md:w-1/3 space-x-2">
      <Input
        placeholder="Αναζήτηση..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Button type="submit" variant="outline" size="icon">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
};
