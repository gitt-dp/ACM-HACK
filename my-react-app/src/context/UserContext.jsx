import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userData, setUserData] = useState({
    user: null,
  });

  // Load from Supabase on mount
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      // Check for existing session in localStorage
      let sessionId = localStorage.getItem('sessionId');
      
      if (sessionId) {
        // Try to load existing session
        const { data, error } = await supabase
          .from('user_sessions')
          .select('user_data')
          .eq('session_id', sessionId)
          .maybeSingle();
        
        if (!error && data) {
          console.log('Loaded existing session:', data);
          setUserData(data.user_data || { user: null });
          return;
        } else if (error) {
          console.log('Error loading session (RLS may be blocking):', error);
        }
      }
      
      // Create new session
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
      
      // Try to create session in Supabase
      const { error: insertError } = await supabase
        .from('user_sessions')
        .insert([{
          session_id: sessionId,
          user_data: { user: null }
        }]);
      
      if (insertError) {
        console.log('Failed to create session in Supabase:', insertError.message);
        console.log('This might be an RLS issue - check your policies');
      } else {
        console.log('New session created in Supabase:', sessionId);
      }
      
    } catch (error) {
      console.log('Session initialization error:', error);
    }
  };

  // Wrapper for setUserData
  const updateUserData = async (newData) => {
    const updatedData = typeof newData === 'function' 
      ? newData(userData) 
      : { ...userData, ...newData };
    
    setUserData(updatedData);

    // Try to save to Supabase
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      try {
        const { error } = await supabase
          .from('user_sessions')
          .update({ 
            user_data: updatedData,
            last_active: new Date().toISOString()
          })
          .eq('session_id', sessionId);
        
        if (error) {
          console.log('Failed to save to Supabase:', error.message);
        } else {
          console.log('✅ Data saved to Supabase');
        }
      } catch (err) {
        console.log('Error saving to Supabase:', err);
      }
    }
  };

  return (
    <UserContext.Provider value={{ userData, setUserData: updateUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}