import React, { useState } from 'react';
import { UserSearch } from './UserSearch';
import { TransferFormData } from '../types';
import { api } from '../api/api';

interface TransferFormProps {
  onTransferComplete: () => void;
}

export const TransferForm: React.FC<TransferFormProps> = ({ onTransferComplete }) => {
  const [formData, setFormData] = useState<TransferFormData>({
    sender: '',
    receiver: '',
    amount: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.sender || !formData.receiver || !formData.amount) {
      setError('All fields are required');
      return;
    }

    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (!Number.isInteger(formData.amount)) {
      setError('Amount must be a whole number');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.transfer(formData);
      setSuccess(response.message);
      
      // Reset form
      setFormData({
        sender: '',
        receiver: '',
        amount: 0
      });
      
      // Notify parent to refresh user list
      onTransferComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-3xl p-6">
      <h2 className="title-lg-semibold text-emphasis mb-6">Transfer Micropatrons</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <UserSearch
          label="From (Sender)"
          placeholder="Search for sender..."
          currentValue={formData.sender}
          onUserSelect={(username) => setFormData({ ...formData, sender: username })}
        />

        <UserSearch
          label="To (Receiver)"
          placeholder="Search for receiver..."
          currentValue={formData.receiver}
          onUserSelect={(username) => setFormData({ ...formData, receiver: username })}
        />

        <div className="space-y-2">
          <label htmlFor="amount" className="body-sm-semibold text-emphasis block">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
            placeholder="Enter amount to transfer"
            min="1"
            step="1"
            className="w-full px-4 py-3 bg-background border border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {error && (
          <div className="bg-negative/10 border border-negative/20 text-negative rounded-xl px-4 py-3 body-sm-normal">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-positive/10 border border-positive/20 text-positive rounded-xl px-4 py-3 body-sm-normal">
            {success}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading} 
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl body-base-semibold hover:bg-primary-hover active:bg-primary-pressed disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Processing...' : 'Transfer'}
        </button>
      </form>
    </div>
  );
};
