
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, DollarSign } from "lucide-react";

const DonationSection = () => {
  const handlePayPalDonation = (amount: number) => {
    // PayPal donation URL - replace with actual PayPal merchant details
    const paypalUrl = `https://www.paypal.com/donate/?business=YOUR_PAYPAL_EMAIL&amount=${amount}&currency_code=EUR&item_name=Donation for Stray Animals`;
    window.open(paypalUrl, '_blank');
  };

  return (
    <section className="container mx-auto px-4 mb-16">
      <Card className="bg-gradient-to-r from-strays-orange to-orange-600 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl md:text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Heart className="h-8 w-8" />
            Στηρίξτε την προσπάθειά μας
          </CardTitle>
          <p className="text-lg opacity-90">
            Κάθε δωρεά βοηθά στη φροντίδα των αδέσποτων ζώων
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold mb-2">Τροφή & Νερό</h3>
                <p className="text-sm mb-4 opacity-90">
                  Καθημερινή διατροφή για αδέσποτα
                </p>
                <Button
                  variant="secondary"
                  onClick={() => handlePayPalDonation(10)}
                  className="w-full"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Δωρεά €10
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold mb-2">Κτηνιατρική Φροντίδα</h3>
                <p className="text-sm mb-4 opacity-90">
                  Εμβόλια, στειρώσεις, θεραπείες
                </p>
                <Button
                  variant="secondary"
                  onClick={() => handlePayPalDonation(25)}
                  className="w-full"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Δωρεά €25
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold mb-2">Καταφύγιο & Στέγαση</h3>
                <p className="text-sm mb-4 opacity-90">
                  Ασφαλής χώρος για αδέσποτα
                </p>
                <Button
                  variant="secondary"
                  onClick={() => handlePayPalDonation(50)}
                  className="w-full"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Δωρεά €50
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <p className="text-sm opacity-90 mb-4">
              Ή επιλέξτε το δικό σας ποσό δωρεάς
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => handlePayPalDonation(0)}
              className="bg-white text-strays-orange hover:bg-gray-100"
            >
              Προσαρμοσμένη Δωρεά
            </Button>
          </div>

          <div className="text-center text-sm opacity-75">
            <p>Όλες οι δωρεές είναι ασφαλείς και γίνονται μέσω PayPal</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default DonationSection;
