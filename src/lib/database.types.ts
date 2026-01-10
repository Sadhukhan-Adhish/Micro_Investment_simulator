export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          risk_profile: 'low' | 'medium' | 'high';
          virtual_balance: number;
          investment_balance: number;
          total_invested: number;
          auto_invest_enabled: boolean;
          auto_invest_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          risk_profile?: 'low' | 'medium' | 'high';
          virtual_balance?: number;
          investment_balance?: number;
          total_invested?: number;
          auto_invest_enabled?: boolean;
          auto_invest_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          risk_profile?: 'low' | 'medium' | 'high';
          virtual_balance?: number;
          investment_balance?: number;
          total_invested?: number;
          auto_invest_enabled?: boolean;
          auto_invest_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'payment' | 'roundup' | 'auto_invest';
          amount: number;
          description: string;
          virtual_balance_after: number;
          investment_balance_after: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'payment' | 'roundup' | 'auto_invest';
          amount: number;
          description: string;
          virtual_balance_after: number;
          investment_balance_after: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'payment' | 'roundup' | 'auto_invest';
          amount?: number;
          description?: string;
          virtual_balance_after?: number;
          investment_balance_after?: number;
          created_at?: string;
        };
      };
      portfolios: {
        Row: {
          id: string;
          user_id: string;
          bonds_amount: number;
          equity_amount: number;
          initial_investment: number;
          current_value: number;
          last_growth_calculation: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bonds_amount?: number;
          equity_amount?: number;
          initial_investment?: number;
          current_value?: number;
          last_growth_calculation?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bonds_amount?: number;
          equity_amount?: number;
          initial_investment?: number;
          current_value?: number;
          last_growth_calculation?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
