import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bankingService } from '../services/banking.service';
import { X, Save, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  profile: any;
  onClose: () => void;
  onUpdate: () => void;
}

export function SettingsModal({ profile, onClose, onUpdate }: SettingsModalProps) {
  const { user } = useAuth();
  const [riskProfile, setRiskProfile] = useState(profile?.risk_profile || 'low');
  const [autoInvestEnabled, setAutoInvestEnabled] = useState(
    profile?.auto_invest_enabled || false
  );
  const [autoInvestAmount, setAutoInvestAmount] = useState(
    profile?.auto_invest_amount || 10
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      await bankingService.updateUserProfile(user.id, {
        risk_profile: riskProfile as 'low' | 'medium' | 'high',
        auto_invest_enabled: autoInvestEnabled,
        auto_invest_amount: parseFloat(autoInvestAmount.toString()),
      });

      setSuccess(true);
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Settings</h2>
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
              <Save className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Settings Updated!</h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Risk Profile
              </label>
              <div className="space-y-2">
                {[
                  { value: 'low', label: 'Low Risk', desc: '80% Bonds, 20% Equity' },
                  { value: 'medium', label: 'Medium Risk', desc: '50% Bonds, 50% Equity' },
                  { value: 'high', label: 'High Risk', desc: '20% Bonds, 80% Equity' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition ${
                      riskProfile === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="riskProfile"
                      value={option.value}
                      checked={riskProfile === option.value}
                      onChange={(e) => setRiskProfile(e.target.value)}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900 text-sm">{option.label}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Daily Auto-Invest
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Automatically invest daily from virtual balance
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoInvestEnabled(!autoInvestEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    autoInvestEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      autoInvestEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {autoInvestEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Amount (Virtual ₹)
                  </label>
                  <select
                    value={autoInvestAmount}
                    onChange={(e) => setAutoInvestAmount(parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="5">₹5 per day</option>
                    <option value="10">₹10 per day</option>
                    <option value="20">₹20 per day</option>
                    <option value="50">₹50 per day</option>
                  </select>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
