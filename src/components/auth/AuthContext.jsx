import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check active session and set the user
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // Get session data
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          
          // Fetch user role from profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles_it_onboard')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          if (profile) {
            setUserRole(profile.role);
          } else {
            console.error('Profile fetch error:', profileError);
            setUserRole('client'); // Default role
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          
          // Fetch user role on auth change
          const { data: profile } = await supabase
            .from('profiles_it_onboard')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          if (profile) {
            setUserRole(profile.role);
          } else {
            setUserRole('client'); // Default role
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
        return { error };
      }

      return { data };
    } catch (error) {
      setAuthError(error.message);
      return { error };
    }
  };

  const register = async (email, password, role = 'client', name) => {
    setAuthError(null);
    try {
      // Register the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role
          }
        }
      });

      if (authError) {
        setAuthError(authError.message);
        return { error: authError };
      }

      return { data: authData };
    } catch (error) {
      setAuthError(error.message);
      return { error };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setAuthError(error.message);
      }
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const resetPassword = async (email) => {
    setAuthError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/#/reset-password',
      });

      if (error) {
        setAuthError(error.message);
        return { error };
      }

      return { success: true };
    } catch (error) {
      setAuthError(error.message);
      return { error };
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { error } = await supabase
        .from('profiles_it_onboard')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        setAuthError(error.message);
        return { error };
      }

      if (updates.role) {
        setUserRole(updates.role);
      }

      return { success: true };
    } catch (error) {
      setAuthError(error.message);
      return { error };
    }
  };

  const value = {
    user,
    userRole,
    loading,
    authError,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    hasRole: (roles) => {
      if (!userRole) return false;
      return roles.includes(userRole);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}