
import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@/lib/router-compat';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from '@/hooks/use-mobile';
import { Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({
    message: 'Παρακαλώ εισάγετε ένα έγκυρο email',
  }),
  password: z.string().min(1, {
    message: 'Ο κωδικός είναι υποχρεωτικός',
  }),
});

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    const success = await login(values.email, values.password);
    setIsLoading(false);
    
    if (success) {
      navigate('/', { replace: true });
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className={`${isMobile ? 'w-full' : 'w-[450px]'} space-y-6`}>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Σύνδεση</h1>
          <p className="text-sm text-gray-600 mt-2">
            Συνδεθείτε για να έχετε πρόσβαση σε όλες τις λειτουργίες
          </p>
        </div>
        
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="google">Google</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="mt-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your.email@example.com" 
                          {...field} 
                          type="email"
                          autoComplete="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between">
                        <FormLabel>Κωδικός</FormLabel>
                        <Link 
                          to="/forgot-password" 
                          className="text-xs text-strays-orange hover:underline"
                        >
                          Ξεχάσατε τον κωδικό σας;
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="••••••••" 
                            type={showPassword ? "text" : "password"}
                            {...field}
                            autoComplete="current-password"
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-strays-orange hover:bg-strays-dark-orange"
                  disabled={isLoading}
                >
                  {isLoading ? 'Σύνδεση...' : 'Σύνδεση'}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="google" className="mt-0">
            <div className="flex flex-col items-center justify-center p-6">
              <Button 
                className="w-full flex items-center justify-center bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                onClick={() => {
                  // In a real app, this would trigger Google authentication
                  alert("Η σύνδεση με Google θα υλοποιηθεί σε μελλοντική έκδοση");
                }}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Συνέχεια με Google
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="text-center text-sm">
          <p>
            Οι εγγραφές είναι προσωρινά σε αναμονή.{' '}
            <Link
              to="/signups-closed"
              className="font-medium text-strays-orange hover:underline"
            >
              Μάθετε περισσότερα
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
