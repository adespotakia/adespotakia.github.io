
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ForumTabContent } from "./ForumTabContent";
import { ForumThread } from "./ForumPostCard";
import CatsRegistry from "./CatsRegistry";
import DogsRegistry from "./DogsRegistry";
import { useForumCategories } from "@/hooks/useForumCategories";

interface ForumTabsProps {
  threads: ForumThread[];
  onLike: (threadId: string) => void;
  onShare: (threadId: string) => void;
  onTabChange: (value: string) => void;
  onDelete?: (threadId: string) => void;
}

const ForumTabs = ({ threads, onLike, onShare, onTabChange, onDelete }: ForumTabsProps) => {
  const { data: categories } = useForumCategories();

  return (
    <Tabs defaultValue="all" onValueChange={onTabChange}>
      <TabsList className="mb-6 flex-wrap h-auto">
        <TabsTrigger value="all">Όλες</TabsTrigger>
        {(categories || []).map((c) => (
          <TabsTrigger key={c.id} value={c.slug}>
            {c.name}
          </TabsTrigger>
        ))}
        <TabsTrigger value="cats">Μητρώο Γάτας</TabsTrigger>
        <TabsTrigger value="dogs">Μητρώο Σκύλου</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-0">
        <ForumTabContent threads={threads} onLike={onLike} onShare={onShare} onDelete={onDelete} />
      </TabsContent>

      {(categories || []).map((c) => (
        <TabsContent key={c.id} value={c.slug} className="mt-0">
          <ForumTabContent threads={threads} category={c.slug} onLike={onLike} onShare={onShare} onDelete={onDelete} />
        </TabsContent>
      ))}

      <TabsContent value="cats" className="mt-0">
        <CatsRegistry />
      </TabsContent>

      <TabsContent value="dogs" className="mt-0">
        <DogsRegistry />
      </TabsContent>
    </Tabs>
  );
};

export default ForumTabs;
