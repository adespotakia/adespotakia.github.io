
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ProductsSection = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stray_products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Demo products if no products exist in database
  const demoProducts = [
    {
      id: 'demo-1',
      name: 'Ταΐστρα Αδέσποτων - 5kg',
      description: 'Tαΐστρα από PVC, ανθεκτικό και ιδανικό υλικό για εξωτερικούς χώρους.',
      price: 5,
      image_urls: ['https://c.ndtvimg.com/2022-08/2ok9qd1_stray-dog-feeder_625x300_17_August_22.jpg?im=FaceCrop,algorithm=dnn,width=1200,height=886']
    },
    {
      id: 'demo-2',
      name: 'Ποτίστρα Αδέσποτων - 5kg',
      description: 'Ποτίστρα από PVC, ανθεκτικό και ιδανικό υλικό για εξωτερικούς χώρους.',
      price: 5,
      image_urls: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']
    },
    {
      id: 'demo-3',
      name: 'Ταίστρα Ποτίστρα - Διπλή',
      description: 'Ζεύγος Tαΐστρας και Ποτίστρας από PVC, ανθεκτικό και ιδανικό υλικό για εξωτερικούς χώρους.',
      price: 10,
      image_urls: ['https://c.ndtvimg.com/2022-08/2ok9qd1_stray-dog-feeder_625x300_17_August_22.jpg?im=FaceCrop,algorithm=dnn,width=1200,height=886']
    },
    {
      id: 'demo-4',
      name: 'Ταΐστρα Μεγάλη - 10kg',
      description: 'Μεγάλη ταΐστρα από ανθεκτικό PVC, ιδανική για μεγαλύτερες ομάδες αδέσποτων.',
      price: 15,
      image_urls: ['https://c.ndtvimg.com/2022-08/2ok9qd1_stray-dog-feeder_625x300_17_August_22.jpg?im=FaceCrop,algorithm=dnn,width=1200,height=886']
    }
  ];

  const handlePayPalPayment = (productId: string, price: number) => {
    // Simple PayPal integration - in a real app you'd use PayPal SDK
    const paypalUrl = `https://www.paypal.com/donate/?business=YOUR_PAYPAL_EMAIL&amount=${price}&currency_code=EUR&item_name=Stray Feeder`;
    window.open(paypalUrl, '_blank');
  };

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Προιόντα φτιαγμένα απο μας</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const displayProducts = products && products.length > 0 ? products : demoProducts;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Ταΐστρες και ποτίστρες για Αδέσποτα</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Όλα τα έσοδα ανατροφοδοτούνται στο κοινό σκοπό, δηλαδή την αγορά τροφής ή την κάλυψη εξόδων στα ιατρεία αδέσποτων.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              {product.image_urls && product.image_urls.length > 0 && (
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={product.image_urls[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <Badge variant="default" className="bg-green-600">
                    €{product.price}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm mb-4">
                  {product.description}
                </CardDescription>
                <Button 
                  onClick={() => handlePayPalPayment(product.id, product.price)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Αγορά με PayPal
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
