import { supabase } from '../lib/supabase';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}

export const authService = {
  async signUp({ email, password, fullName }: SignUpData) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        email: email,
        risk_profile: 'low',
        virtual_balance: 10000,
        investment_balance: 0,
        total_invested: 0,
        auto_invest_enabled: false,
        auto_invest_amount: 10,
      });

    if (profileError) throw profileError;

    const { error: portfolioError } = await supabase
      .from('portfolios')
      .insert({
        user_id: authData.user.id,
        bonds_amount: 0,
        equity_amount: 0,
        initial_investment: 0,
        current_value: 0,
      });

    if (portfolioError) throw portfolioError;

    return authData;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  },
};
