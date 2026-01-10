import { PieChart, TrendingUp } from 'lucide-react';

interface PortfolioViewProps {
  portfolio: any;
  riskProfile: string;
}

export function PortfolioView({ portfolio, riskProfile }: PortfolioViewProps) {
  const totalValue = portfolio.current_value || 0;
  const bondsPercentage = totalValue > 0 ? (portfolio.bonds_amount / totalValue) * 100 : 0;
  const equityPercentage = totalValue > 0 ? (portfolio.equity_amount / totalValue) * 100 : 0;
  const growthAmount = totalValue - portfolio.initial_investment;
  const growthPercentage = portfolio.initial_investment > 0
    ? ((growthAmount / portfolio.initial_investment) * 100)
    : 0;

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'Low Risk';
      case 'medium':
        return 'Medium Risk';
      case 'high':
        return 'High Risk';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-gray-600" />
          <h3 className="font-bold text-gray-900">Portfolio Overview</h3>
        </div>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
          {getRiskLabel(riskProfile)}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Current Value (Virtual)</span>
            <span className="font-bold text-gray-900">₹{totalValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Initial Investment</span>
            <span className="text-gray-700">₹{portfolio.initial_investment.toFixed(2)}</span>
          </div>
        </div>

        {portfolio.initial_investment > 0 && (
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Simulated Growth</span>
            </div>
            <p className="text-lg font-bold text-green-700">
              +₹{growthAmount.toFixed(2)} ({growthPercentage >= 0 ? '+' : ''}{growthPercentage.toFixed(2)}%)
            </p>
            <p className="text-xs text-green-700 mt-1">Virtual growth simulation</p>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Asset Allocation</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Bonds (4% annual)</span>
                <span className="font-semibold">₹{portfolio.bonds_amount.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${bondsPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{bondsPercentage.toFixed(1)}%</p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Equity (8% annual)</span>
                <span className="font-semibold">₹{portfolio.equity_amount.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${equityPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{equityPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
          <p>
            Allocation is AI-based (rule-based) according to your risk profile.
            Growth rates are simulated for educational purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
