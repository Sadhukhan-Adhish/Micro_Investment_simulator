import { supabase } from '../lib/supabase';

export type RiskProfile = 'low' | 'medium' | 'high';

interface AllocationStrategy {
  bonds: number;
  equity: number;
}

const ALLOCATION_STRATEGIES: Record<RiskProfile, AllocationStrategy> = {
  low: { bonds: 0.8, equity: 0.2 },
  medium: { bonds: 0.5, equity: 0.5 },
  high: { bonds: 0.2, equity: 0.8 },
};

const ANNUAL_RETURNS = {
  bonds: 0.04,
  equity: 0.08,
};

export const investmentService = {
  getAllocationStrategy(riskProfile: RiskProfile): AllocationStrategy {
    return ALLOCATION_STRATEGIES[riskProfile];
  },

  calculateAllocation(amount: number, riskProfile: RiskProfile) {
    const strategy = this.getAllocationStrategy(riskProfile);
    return {
      bonds: amount * strategy.bonds,
      equity: amount * strategy.equity,
    };
  },

  async allocateInvestment(userId: string, amount: number, riskProfile: RiskProfile) {
    const allocation = this.calculateAllocation(amount, riskProfile);

    const { data: portfolio, error: fetchError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (portfolio) {
      const { error: updateError } = await supabase
        .from('portfolios')
        .update({
          bonds_amount: portfolio.bonds_amount + allocation.bonds,
          equity_amount: portfolio.equity_amount + allocation.equity,
          initial_investment: portfolio.initial_investment + amount,
          current_value: portfolio.current_value + amount,
          last_growth_calculation: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('portfolios')
        .insert({
          user_id: userId,
          bonds_amount: allocation.bonds,
          equity_amount: allocation.equity,
          initial_investment: amount,
          current_value: amount,
        });

      if (insertError) throw insertError;
    }
  },

  calculateGrowth(
    bondsAmount: number,
    equityAmount: number,
    startDate: string
  ): number {
    const start = new Date(startDate);
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (daysPassed <= 0) return bondsAmount + equityAmount;

    const yearsPassed = daysPassed / 365;

    const bondsGrowth = bondsAmount * Math.pow(1 + ANNUAL_RETURNS.bonds, yearsPassed);
    const equityGrowth = equityAmount * Math.pow(1 + ANNUAL_RETURNS.equity, yearsPassed);

    return bondsGrowth + equityGrowth;
  },

  async refreshPortfolioGrowth(userId: string) {
    const { data: portfolio, error: fetchError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!portfolio) return null;

    const currentValue = this.calculateGrowth(
      portfolio.bonds_amount,
      portfolio.equity_amount,
      portfolio.last_growth_calculation
    );

    const { error: updateError } = await supabase
      .from('portfolios')
      .update({
        current_value: currentValue,
        last_growth_calculation: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    return currentValue;
  },
};
