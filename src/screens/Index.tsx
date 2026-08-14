
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Heart, MessageSquare } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useAuth } from "@/contexts/AuthContext";
import NewsList from "@/components/news/NewsList";
import AdoptionsShowcase from "@/components/adoptions/AdoptionsShowcase";

const Index = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1415369629372-26f2fe60c467')"
        }}>
        </div>
        <div className="relative container mx-auto px-4 py-20 text-center text-white">
          <h1 className="text-3xl md:text-3xl font-bold mb-6">
            Αδεσπολις Ξάνθης
          </h1>
          <p className="text-xl md:text-xl mb-8 max-w-3xl mx-auto">
            Η "Αδεσπολις" είναι μια ανεξάρτητη, ιδιωτική πρωτοβουλία πολιτών που αγαπούν και φροντίζουν αδέσποτα ζώα στην Ξάνθη. 

            Δεν ανήκουμε σε κάποιον επίσημο φορέα ούτε εκπροσωπούμε κάποιον οργανισμό, είμαστε απλώς άνθρωποι που νοιαζόμαστε. 

            Φτιάξαμε αυτόν τον χώρο για να δώσουμε φωνή στα ζώα που δεν έχουν φωνή, και για να διευκολύνουμε όσους θέλουν να προσφέρουν. 

            Η πλατφόρμα παρέχει εργαλεία για την καταγραφή, τη στήριξη και την καλύτερη φροντίδα των αδέσποτων, με στόχο τη συνεργασία και την αλληλεγγύη σε επίπεδο γειτονιάς.

            Αν πιστεύεις κι εσύ πως κάθε ζωή έχει αξία και θέλεις να βοηθήσεις έμπρακτα, η πόλη και οι τετράποδοι φίλοι της σε χρειάζονται. 

            Μαζί μπορούμε να κάνουμε τη διαφορά.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                  <Link to="/report">Αναφορά Αδέσποτου</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-orange-600 hover:bg-white hover:text-gray-600">
                  <Link to="/forum">Συμμετοχή στη Κοινότητα</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                  <Link to="/signups-closed">Εγγραφή τώρα!</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-orange-600 hover:bg-white hover:text-gray-600">
                  <Link to="/community">Περισσότερες πληροφορίες</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* News Section - Updated title */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Τελευταία Νέα</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ενημερωθείτε για τις τελευταίες δράσεις και εξελίξεις σχετικά με τα αδέσποτα ζώα
            </p>
          </div>
          <NewsList />
        </div>
      </section>

      {/* Adoptions Section (public) */}
      <AdoptionsShowcase />


      {/* Community Highlights Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Η Κοινότητά μας</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Ενεργά Μέλη</CardTitle>
                <CardDescription>
                  Περισσότερα από 0 ενεργά μέλη που βοηθούν καθημερινά σε διαφορες γειτονιές της πόλης
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Αδέσποτα που Βοηθήθηκαν</CardTitle>
                <CardDescription>
                  Πάνω από 00 αδέσποτα έχουν λάβει καταγραφεί ή βοηθηθει μέσω της πλατφόρμας μας
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Ενεργές Συζητήσεις</CardTitle>
                <CardDescription>
                  Καθημερινή επικοινωνία και οργάνωση ή ανταλλαγή ιδεών στο φόρουμ
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
