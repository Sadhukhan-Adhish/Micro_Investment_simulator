import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface UserProfile {
  id: string;
  risk_profile: 'low' | 'medium' | 'high';
  virtual_balance: number;
  investment_balance: number;
  total_invested: number;
  auto_invest_amount: number;
}

interface Portfolio {
  user_id: string;
  bonds_amount: number;
  equity_amount: number;
  initial_investment: number;
  current_value: number;
}

const ALLOCATION_STRATEGIES = {
  low: { bonds: 0.8, equity: 0.2 },
  medium: { bonds: 0.5, equity: 0.5 },
  high: { bonds: 0.2, equity: 0.8 },
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: eligibleUsers, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('auto_invest_enabled', true);

    if (fetchError) throw fetchError;

    const results = {
      processed: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[],
    };

    for (const user of (eligibleUsers as UserProfile[]) || []) {
      try {
        if (user.virtual_balance < user.auto_invest_amount) {
          results.skipped++;
          results.details.push({
            userId: user.id,
            status: 'skipped',
            reason: 'insufficient balance',
          });
          continue;
        }

        const newVirtualBalance = user.virtual_balance - user.auto_invest_amount;
        const newInvestmentBalance = user.investment_balance + user.auto_invest_amount;
        const newTotalInvested = user.total_invested + user.auto_invest_amount;

        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            virtual_balance: newVirtualBalance,
            investment_balance: newInvestmentBalance,
            total_invested: newTotalInvested,
          })
          .eq('id', user.id);

        if (updateError) throw updateError;

        const { error: txnError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'auto_invest',
            amount: user.auto_invest_amount,
            description: `Daily Auto-Invest: ₹${user.auto_invest_amount.toFixed(2)} Virtual`,
            virtual_balance_after: newVirtualBalance,
            investment_balance_after: newInvestmentBalance,
          });

        if (txnError) throw txnError;

        const strategy = ALLOCATION_STRATEGIES[user.risk_profile];
        const bondsAllocation = user.auto_invest_amount * strategy.bonds;
        const equityAllocation = user.auto_invest_amount * strategy.equity;

        const { data: portfolio, error: portfolioFetchError } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (portfolioFetchError) throw portfolioFetchError;

        if (portfolio) {
          const { error: portfolioUpdateError } = await supabase
            .from('portfolios')
            .update({
              bonds_amount: portfolio.bonds_amount + bondsAllocation,
              equity_amount: portfolio.equity_amount + equityAllocation,
              initial_investment: portfolio.initial_investment + user.auto_invest_amount,
              current_value: portfolio.current_value + user.auto_invest_amount,
              last_growth_calculation: new Date().toISOString(),
            })
            .eq('user_id', user.id);

          if (portfolioUpdateError) throw portfolioUpdateError;
        }

        results.processed++;
        results.details.push({
          userId: user.id,
          status: 'success',
          amount: user.auto_invest_amount,
        });
      } catch (error: any) {
        results.errors++;
        results.details.push({
          userId: user.id,
          status: 'error',
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Daily auto-invest completed',
        results,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});