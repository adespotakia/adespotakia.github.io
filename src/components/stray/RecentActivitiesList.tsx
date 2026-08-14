
import { Badge } from "@/components/ui/badge";
import { Heart, Pill, Scissors, Syringe, Plus, Tablets } from "lucide-react";
import { sanitizeText } from "@/utils/inputSanitization";

interface RecentActivitiesListProps {
  activities: any[] | undefined;
  isLoading: boolean;
}

const RecentActivitiesList = ({ activities, isLoading }: RecentActivitiesListProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'feeding': return <Heart className="h-4 w-4" />;
      case 'medical': return <Pill className="h-4 w-4" />;
      case 'grooming': return <Scissors className="h-4 w-4" />;
      case 'vaccination': return <Syringe className="h-4 w-4" />;
      case 'pill': return <Tablets className="h-4 w-4" />;
      default: return <Plus className="h-4 w-4" />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    const labels = {
      feeding: 'Ταΐσμα',
      medical: 'Ιατρική Περίθαλψη',
      grooming: 'Περιποίηση',
      vaccination: 'Εμβολιασμός',
      pill: 'Χάπι',
      other: 'Άλλο'
    };
    return labels[type as keyof typeof labels] || sanitizeText(type);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <p className="text-gray-600 text-center py-8">
        Δεν υπάρχουν καταγεγραμμένες δραστηριότητες ακόμα.
      </p>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {activities.map((activity) => (
        <div key={activity.id} className="border rounded-md p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {getActivityIcon(activity.activity_type)}
              <div>
                <div className="font-medium">{sanitizeText(activity.strays?.name || 'Άγνωστο')}</div>
                <div className="text-sm text-gray-600">
                  {sanitizeText(activity.activity_description || '')}
                </div>
              </div>
            </div>
            <Badge variant="outline">
              {getActivityTypeLabel(activity.activity_type)}
            </Badge>
          </div>
          <div className="mt-2 text-xs text-gray-500 flex justify-between">
            <span>Από: {sanitizeText(activity.profile?.username || 'Άγνωστος')}</span>
            <span>{new Date(activity.activity_date).toLocaleDateString('el-GR')}</span>
          </div>
          {activity.unit && (
            <div className="text-sm text-blue-600 mt-1">
              Τύπος: {sanitizeText(activity.unit)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RecentActivitiesList;
