import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bankingService } from '../services/banking.service';
import { investmentService } from '../services/investment.service';
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Settings,
  History,
  LogOut,
  RefreshCw,
  CreditCard,
} from 'lucide-react';
import { PaymentModal } from './PaymentModal';
import { TransactionHistory } from './TransactionHistory';
import { SettingsModal } from './SettingsModal';
import { PortfolioView } from './PortfolioView';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const loadData = async () => {
    if (!user) return;

    try {
      const [userProfile, userPortfolio] = await Promise.all([
        bankingService.getUserProfile(user.id),
        bankingService.getPortfolio(user.id),
      ]);

      setProfile(userProfile);
      setPortfolio(userPortfolio);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleRefreshPortfolio = async () => {
    if (!user) return;

    setRefreshing(true);
    try {
      await investmentService.refreshPortfolioGrowth(user.id);
      await loadData();
    } catch (error) {
      console.error('Error refreshing portfolio:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Micro-Invest</h1>
              <p className="text-xs text-gray-500">Virtual Simulator</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800 text-center">
            Educational simulator - All values are virtual with no real monetary value
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium">Virtual Bank Balance</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ₹{profile?.virtual_balance.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Virtual Currency</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Investment Wallet</span>
            </div>
            <p className="text-3xl font-bold text-green-600">
              ₹{profile?.investment_balance.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Virtual Investment</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">Total Invested</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ₹{profile?.total_invested.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Cumulative Virtual Investment</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">Auto-Invest Status</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {profile?.auto_invest_enabled ? 'Enabled' : 'Disabled'}
            </p>
            {profile?.auto_invest_enabled && (
              <p className="text-xs text-gray-500 mt-1">
                ₹{profile.auto_invest_amount} per day (Virtual)
              </p>
            )}
          </div>
        </div>

        {portfolio && <PortfolioView portfolio={portfolio} riskProfile={profile?.risk_profile} />}

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <CreditCard className="w-5 h-5" />
            Make Payment
          </button>

          <button
            onClick={handleRefreshPortfolio}
            disabled={refreshing}
            className="bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Growth
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setShowTransactions(true)}
            className="bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <History className="w-5 h-5" />
            Transactions
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </div>
      </main>

      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onSuccess={loadData}
        />
      )}

      {showTransactions && (
        <TransactionHistory onClose={() => setShowTransactions(false)} />
      )}

      {showSettings && (
        <SettingsModal
          profile={profile}
          onClose={() => setShowSettings(false)}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}
