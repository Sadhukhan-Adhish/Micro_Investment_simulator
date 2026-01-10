import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bankingService } from '../services/banking.service';
import { X, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

interface PaymentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ onClose, onSuccess }: PaymentModalProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<any>(null);

  const roundUpAmount = amount ? bankingService.calculateRoundUp(parseFloat(amount)) : 0;
  const totalDeduction = amount ? parseFloat(amount) + roundUpAmount : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      const paymentAmount = parseFloat(amount);
      if (paymentAmount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      const paymentResult = await bankingService.makePayment(user.id, paymentAmount);
      setResult(paymentResult);
      setSuccess(true);

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Make Virtual Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Payment: ₹{result?.paymentAmount.toFixed(2)} (Virtual)</p>
              <p>Round-up: ₹{result?.roundUpAmount.toFixed(2)} (Virtual)</p>
              <p className="font-semibold text-green-600">Invested automatically!</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                Amount will be rounded up to the nearest ₹5, and the difference will be automatically invested.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Amount (Virtual ₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="0.00"
                required
              />
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment:</span>
                  <span className="font-semibold">₹{parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rounded to:</span>
                  <span className="font-semibold">₹{bankingService.roundUpAmount(parseFloat(amount)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Round-up Investment:</span>
                  <span className="font-semibold">₹{roundUpAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
                  <span>Total Deduction:</span>
                  <span>₹{totalDeduction.toFixed(2)}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              {loading ? 'Processing...' : 'Make Virtual Payment'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
