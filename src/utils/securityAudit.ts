
import { supabase } from "@/integrations/supabase/client";

interface SecurityEvent {
  event_type: 'login' | 'failed_login' | 'data_access' | 'admin_action' | 'suspicious_activity';
  user_id?: string;
  details: string;
  ip_address?: string;
  user_agent?: string;
}

export const logSecurityEvent = async (event: SecurityEvent) => {
  try {
    console.log('Security Event:', {
      timestamp: new Date().toISOString(),
      ...event
    });
    
    // In a production environment, you would send this to a secure logging service
    // For now, we'll just log to console for development purposes
    
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

export const validateUserSession = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      await logSecurityEvent({
        event_type: 'suspicious_activity',
        details: 'Attempted access without valid session'
      });
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};

export const checkRateLimit = (action: string, userId?: string): boolean => {
  // Simple in-memory rate limiting for demonstration
  // In production, use Redis or similar
  const key = `${action}-${userId || 'anonymous'}`;
  const now = Date.now();
  const window = 60000; // 1 minute
  const limit = 10; // 10 requests per minute
  
  const stored = localStorage.getItem(key);
  if (stored) {
    const data = JSON.parse(stored);
    if (now - data.timestamp < window) {
      if (data.count >= limit) {
        logSecurityEvent({
          event_type: 'suspicious_activity',
          user_id: userId,
          details: `Rate limit exceeded for action: ${action}`
        });
        return false;
      }
      data.count++;
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      localStorage.setItem(key, JSON.stringify({ timestamp: now, count: 1 }));
    }
  } else {
    localStorage.setItem(key, JSON.stringify({ timestamp: now, count: 1 }));
  }
  
  return true;
};
