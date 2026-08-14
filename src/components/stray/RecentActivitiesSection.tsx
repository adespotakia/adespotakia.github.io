
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RecentActivitiesList from "@/components/stray/RecentActivitiesList";

interface RecentActivitiesSectionProps {
  activities: any[] | undefined;
  isLoading: boolean;
}

const RecentActivitiesSection = ({ activities, isLoading }: RecentActivitiesSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Πρόσφατες Δραστηριότητες</CardTitle>
        <CardDescription>
          Οι τελευταίες δραστηριότητες φροντίδας αδέσποτων
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RecentActivitiesList
          activities={activities}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default RecentActivitiesSection;
