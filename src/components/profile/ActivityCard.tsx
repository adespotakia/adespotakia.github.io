
import ActivityImage from "./ActivityImage";
import ActivityDetails from "./ActivityDetails";

interface ActivityCardProps {
  activity: {
    id: string;
    activity_type: string;
    activity_description: string;
    notes: string;
    created_at: string;
    image_urls: string[];
    strays: {
      id: string;
      name: string;
      location_description: string;
      image_urls?: string[];
    };
  };
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
  // Get the first image from stray if activity has no images
  const strayImageUrl = activity.strays?.image_urls?.[0];
  
  return (
    <div className="p-6 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
      <ActivityImage 
        imageUrls={activity.image_urls} 
        strayImageUrl={strayImageUrl}
      />
      <ActivityDetails
        activityType={activity.activity_type}
        strayName={activity.strays?.name}
        activityDescription={activity.activity_description}
        locationDescription={activity.strays?.location_description}
        notes={activity.notes}
        createdAt={activity.created_at}
      />
    </div>
  );
};

export default ActivityCard;
