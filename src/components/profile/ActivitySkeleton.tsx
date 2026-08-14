
const ActivitySkeleton = () => {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-6 border border-gray-100 rounded-lg">
          <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg mb-4"></div>
          <div className="space-y-2">
            <div className="w-3/4 h-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-1/2 h-3 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-1/4 h-3 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivitySkeleton;
