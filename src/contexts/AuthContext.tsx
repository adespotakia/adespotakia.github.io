import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
// Rename the imported User type to SupabaseUser
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

// Types
interface UserProfile {
  id: string;
  username: string;
  email: string;
  phoneVerified: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  verifyPhone: (phone: string, code: string) => Promise<boolean>;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  verifyPhone: async () => false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Fetch user profile data
  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, phone_verified')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUser({
        id: authUser.id,
        email: authUser.email || '',
        username: data?.username || '',
        phoneVerified: data?.phone_verified || false,
      });
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  // Check for user session on mount
  useEffect(() => {
    const setupAuth = async () => {
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, currentSession) => {
          setSession(currentSession);
          if (currentSession?.user) {
            fetchUserProfile(currentSession.user);
          } else {
            setUser(null);
          }
        }
      );

      // Check for existing session
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      
      if (initialSession?.user) {
        await fetchUserProfile(initialSession.user);
      }
      
      setIsLoading(false);
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    setupAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Αποτυχία σύνδεσης",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      if (data.user) {
        toast({
          title: "Επιτυχής σύνδεση",
          description: "Καλωσήρθατε πίσω!",
        });
        return true;
      }
      
      return false;
    } catch (error: any) {
      toast({
        title: "Σφάλμα",
        description: error.message || "Προέκυψε κάποιο σφάλμα κατά τη σύνδεση",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
          emailRedirectTo: window.location.origin,
        },
      });
      
      if (error) {
        toast({
          title: "Αποτυχία εγγραφής",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      if (data.user) {
        toast({
          title: "Επιτυχής εγγραφή",
          description: "Ο λογαριασμός σας δημιουργήθηκε με επιτυχία",
        });
        return true;
      }
      
      return false;
    } catch (error: any) {
      toast({
        title: "Σφάλμα",
        description: error.message || "Προέκυψε κάποιο σφάλμα κατά την εγγραφή",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('registration_progress');
    setUser(null);
    toast({
      title: "Αποσύνδεση",
      description: "Αποσυνδεθήκατε με επιτυχία",
    });
  };

  // Verify phone function - simplified for demo mode
  const verifyPhone = async (phone: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      if (!user) {
        toast({
          title: "Σφάλμα",
          description: "Πρέπει να είστε συνδεδεμένοι",
          variant: "destructive",
        });
        return false;
      }
      
      console.log('Verifying phone with code:', code, 'Length:', code.length);
      
      // Demo mode - accept any 6-digit code
      if (code.length === 6) {
        console.log('Code accepted for demo mode');
        
        const { error } = await supabase
          .from('profiles')
          .update({ 
            phone: phone,
            phone_verified: true 
          })
          .eq('id', user.id);
        
        if (error) {
          console.error('Supabase update error:', error);
          toast({
            title: "Αποτυχία επιβεβαίωσης",
            description: "Προέκυψε σφάλμα κατά την επιβεβαίωση",
            variant: "destructive",
          });
          return false;
        }
        
        // Update local user state
        setUser(prev => prev ? {...prev, phoneVerified: true} : null);
        
        toast({
          title: "Επιβεβαίωση τηλεφώνου",
          description: "Το τηλέφωνό σας επιβεβαιώθηκε με επιτυχία",
        });
        return true;
      } else {
        console.log('Code rejected - not 6 digits');
        toast({
          title: "Αποτυχία επιβεβαίωσης",
          description: "Παρακαλώ εισάγετε έναν 6-ψήφιο κωδικό",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error('Phone verification error:', error);
      toast({
        title: "Σφάλμα",
        description: error.message || "Προέκυψε κάποιο σφάλμα",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      verifyPhone,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
