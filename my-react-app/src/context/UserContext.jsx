import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userData, setUserData] = useState({
    user: null,
  });

  // Load from Supabase on mount (optional - won't break if missing)
  useEffect(() => {
    const loadFromSupabase = async () => {
      const savedSessionId = localStorage.getItem('sessionId');
      if (savedSessionId) {
        try {
          const { data } = await supabase
            .from('user_sessions')
            .select('user_data')
            .eq('session_id', savedSessionId)
            .single();
          
          if (data?.user_data) {
            setUserData(data.user_data);
          }
        } catch (error) {
          console.log('Supabase not ready yet, using local state');
        }
      }
    };
    loadFromSupabase();
  }, []);

  // Wrapper for setUserData
  const updateUserData = (newData) => {
    // Update local state first (this keeps UI working)
    const updatedData = typeof newData === 'function' 
      ? newData(userData) 
      : { ...userData, ...newData };
    
    setUserData(updatedData);

    // Try to save to Supabase (won't break if it fails)
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      supabase
        .from('user_sessions')
        .update({ user_data: updatedData })
        .eq('session_id', sessionId)
        .then(() => console.log('Saved to Supabase'))
        .catch(err => console.log('Supabase save failed, but UI works'));
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