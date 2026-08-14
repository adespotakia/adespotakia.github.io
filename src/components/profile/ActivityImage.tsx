
interface ActivityImageProps {
  imageUrls: string[];
}

interface ActivityImageWithStrayProps extends ActivityImageProps {
  strayImageUrl?: string;
}

const ActivityImage = ({ imageUrls, strayImageUrl }: ActivityImageWithStrayProps) => {
  // Ensure imageUrls is always an array and has at least one valid URL
  const validImageUrls = Array.isArray(imageUrls) ? imageUrls.filter(url => url && url.trim() !== '') : [];
  
  // Use activity image if available, otherwise use stray's first image
  const displayImageUrl = validImageUrls.length > 0 ? validImageUrls[0] : strayImageUrl;
  
  return (
    <div className="mb-4">
      {displayImageUrl ? (
        <img
          src={displayImageUrl}
          alt="Δραστηριότητα"
          className="w-full h-64 object-cover rounded-lg border border-gray-200"
          onError={(e) => {
            console.error('Error loading activity image:', displayImageUrl);
            // Show placeholder on error
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yIGxvYWRpbmcgaW1hZ2U8L3RleHQ+PC9zdmc+';
          }}
        />
      ) : (
        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-400 text-lg">Χωρίς φωτογραφία</span>
        </div>
      )}
    </div>
  );
};

export default ActivityImage;
