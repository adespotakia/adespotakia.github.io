
import { Button } from "@/components/ui/button";
import { ForumSearch } from "./ForumSearch";
import { NewThreadDialog } from "./NewThreadDialog";

interface ForumHeaderProps {
  activeTab: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  isAuthenticated: boolean;
  onCreateThread: (thread: { title: string; content: string; category: string }) => Promise<void>;
  isLoading: boolean;
}

const ForumHeader = ({
  activeTab,
  searchTerm,
  setSearchTerm,
  handleSearch,
  isAuthenticated,
  onCreateThread,
  isLoading
}: ForumHeaderProps) => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Χώρος συζητήσεων</h1>
        <p className="text-gray-600">
          Συζητήστε, μοιραστείτε εμπειρίες και ζητήστε βοήθεια για αδέσποτα ζώα
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        {activeTab !== "strays" && (
          <ForumSearch 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            handleSearch={handleSearch} 
          />
        )}

        {activeTab !== "strays" && (
          <NewThreadDialog 
            isAuthenticated={isAuthenticated} 
            onCreateThread={onCreateThread} 
            isLoading={isLoading} 
          />
        )}
      </div>
    </>
  );
};

export default ForumHeader;
