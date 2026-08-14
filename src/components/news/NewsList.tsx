import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import NewsCard from "./NewsCard";
import { useNews } from "@/hooks/useNews";

const NewsList = () => {
  const { data: newsItems = [], isLoading } = useNews();

  // Show only the first 4 items on the index page
  const visibleItems = newsItems.slice(0, 4);

  if (isLoading) {
    return (
      <div className="text-center text-gray-500 py-8">Φόρτωση νέων...</div>
    );
  }

  if (visibleItems.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Δεν υπάρχουν διαθέσιμα νέα αυτή τη στιγμή.
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
      {visibleItems.map((item) => (
        <NewsCard key={item.id} item={item} />
      ))}

      {/* Show All News Button */}
      <div className="md:col-span-2 text-center mt-8">
        <Button asChild className="bg-strays-orange text-white px-8 py-3 rounded-lg hover:bg-strays-orange/90 transition-colors">
          <Link to="/news">Περισσότερα Νέα</Link>
        </Button>
      </div>
    </div>
  );
};

export default NewsList;
