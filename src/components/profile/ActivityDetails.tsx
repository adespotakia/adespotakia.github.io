
interface ActivityDetailsProps {
  activityType: string;
  strayName?: string;
  activityDescription: string;
  locationDescription?: string;
  notes?: string;
  createdAt: string;
}

const ActivityDetails = ({
  activityType,
  strayName,
  activityDescription,
  locationDescription,
  notes,
  createdAt
}: ActivityDetailsProps) => {
  const formatActivityType = (type: string) => {
    switch (type) {
      case 'feeding':
        return 'Φαγητό';
      case 'medical':
        return 'Ιατρική περίθαλψη';
      case 'grooming':
        return 'Καλλωπισμός';
      case 'vaccination':
        return 'Εμβολιασμός';
      case 'other':
        return 'Άλλο';
      default:
        return type;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('el-GR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-lg">
            {formatActivityType(activityType)} - {strayName || 'Άγνωστο αδέσποτο'}
          </h4>
          <p className="text-gray-600 mt-1">
            {activityDescription}
          </p>
        </div>
        <div className="text-strays-orange font-medium text-lg ml-4">
          +3
        </div>
      </div>
      
      {locationDescription && (
        <p className="text-sm text-gray-500 flex items-center">
          <span className="mr-1">📍</span>
          {locationDescription}
        </p>
      )}
      
      {notes && (
        <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded">
          {notes}
        </p>
      )}
      
      <div className="text-sm text-gray-400">
        {formatDate(createdAt)}
      </div>
    </div>
  );
};

export default ActivityDetails;
