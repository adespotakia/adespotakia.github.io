import { useParams, Link } from "@/lib/router-compat";
import { ArrowLeft, Calendar, Tag, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import NewsComments from "@/components/news/NewsComments";
import { useNews } from "@/hooks/useNews";

const NewsArticle = () => {
  const { articleId } = useParams();
  const { toast } = useToast();

  const { data: newsItems = [], isLoading } = useNews();

  const article = newsItems.find(item => item.id === articleId);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-gray-500">
        Φόρτωση άρθρου...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Το άρθρο δεν βρέθηκε</h1>
          <Button asChild>
            <Link to="/">Επιστροφή στην αρχική</Link>
          </Button>
        </div>
      </div>
    );
  }


  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('el-GR', options);
  };

  const shareUrl = `${window.location.origin}/news/${article.id}`;

  const handleShare = async (platform: 'facebook' | 'twitter' | 'whatsapp' | 'copy') => {
    let url = '';
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(article.title + ' ' + shareUrl)}`;
        window.open(url, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Ο σύνδεσμος αντιγράφηκε",
          description: "Ο σύνδεσμος αντιγράφηκε στο πρόχειρο",
        });
        break;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Return Button */}
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Επιστροφή
          </Link>
        </Button>
      </div>

      {/* Article Content */}
      <article className="mb-8">
        {article.image && (
          <div className="w-full h-64 md:h-96 overflow-hidden rounded-lg mb-6">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-strays-dark-orange mb-4">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-between gap-4 text-gray-600 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(article.date)}</span>
              </div>
              {article.source && (
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  <span>{article.source}</span>
                </div>
              )}
            </div>
            
            {/* Share Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Share className="mr-2 h-4 w-4" /> 
                  Κοινοποίηση
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleShare('facebook')}>
                  Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('twitter')}>
                  Twitter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
                  WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('copy')}>
                  Αντιγραφή συνδέσμου
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed [&_img]:my-4 [&_img]:rounded-lg [&_img]:max-w-full"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>

      <Separator className="my-8" />

      {/* Comments Section */}
      <NewsComments articleId={article.id} />
    </div>
  );
};

export default NewsArticle;
