import { supabase } from '../lib/supabase';
import { investmentService } from './investment.service';

export const bankingService = {
  roundUpAmount(amount: number): number {
    return Math.ceil(amount / 5) * 5;
  },

  calculateRoundUp(paymentAmount: number): number {
    const roundedAmount = this.roundUpAmount(paymentAmount);
    return roundedAmount - paymentAmount;
  },

  async makePayment(userId: string, amount: number) {
    const { data: profile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const roundUpAmount = this.calculateRoundUp(amount);
    const totalDeduction = amount + roundUpAmount;

    if (profile.virtual_balance < totalDeduction) {
      throw new Error('Insufficient virtual balance');
    }

    const newVirtualBalance = profile.virtual_balance - totalDeduction;
    const newInvestmentBalance = profile.investment_balance + roundUpAmount;
    const newTotalInvested = profile.total_invested + roundUpAmount;

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        virtual_balance: newVirtualBalance,
        investment_balance: newInvestmentBalance,
        total_invested: newTotalInvested,
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    const { error: paymentTxnError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'payment',
        amount: amount,
        description: `Virtual Payment: ₹${amount.toFixed(2)}`,
        virtual_balance_after: newVirtualBalance + roundUpAmount,
        investment_balance_after: profile.investment_balance,
      });

    if (paymentTxnError) throw paymentTxnError;

    const { error: roundUpTxnError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'roundup',
        amount: roundUpAmount,
        description: `Round-up Investment: ₹${roundUpAmount.toFixed(2)} Virtual`,
        virtual_balance_after: newVirtualBalance,
        investment_balance_after: newInvestmentBalance,
      });

    if (roundUpTxnError) throw roundUpTxnError;

    await investmentService.allocateInvestment(
      userId,
      roundUpAmount,
      profile.risk_profile
    );

    return {
      paymentAmount: amount,
      roundUpAmount,
      newVirtualBalance,
      newInvestmentBalance,
    };
  },

  async getTransactions(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserProfile(
    userId: string,
    updates: {
      risk_profile?: 'low' | 'medium' | 'high';
      auto_invest_enabled?: boolean;
      auto_invest_amount?: number;
    }
  ) {
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
  },

  async getPortfolio(userId: string) {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};
