import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bankingService } from '../services/banking.service';
import { X, ArrowDownCircle, TrendingUp, RefreshCw } from 'lucide-react';

interface TransactionHistoryProps {
  onClose: () => void;
}

export function TransactionHistory({ onClose }: TransactionHistoryProps) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;

    try {
      const data = await bankingService.getTransactions(user.id);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <ArrowDownCircle className="w-5 h-5 text-red-600" />;
      case 'roundup':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'auto_invest':
        return <RefreshCw className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'text-red-600';
      case 'roundup':
      case 'auto_invest':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Make a payment to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getTransactionIcon(txn.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">
                          {txn.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(txn.created_at).toLocaleString()}
                        </p>
                        <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                          <p>Bank Balance: ₹{txn.virtual_balance_after.toFixed(2)}</p>
                          <p>Investment: ₹{txn.investment_balance_after.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className={`font-bold ${getTransactionColor(txn.type)}`}>
                        {txn.type === 'payment' ? '-' : '+'}₹{Math.abs(txn.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {txn.type === 'payment' && 'Payment'}
                        {txn.type === 'roundup' && 'Round-up'}
                        {txn.type === 'auto_invest' && 'Auto-invest'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
