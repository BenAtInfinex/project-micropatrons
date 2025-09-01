import React, { useState } from 'react';
import { api } from '../api/api';
import { UserSearch } from './UserSearch';

interface OpSecReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportSuccess: () => void;
}

export const OpSecReportModal: React.FC<OpSecReportModalProps> = ({ 
  isOpen, 
  onClose, 
  onReportSuccess 
}) => {
  const [formData, setFormData] = useState({
    victim: '',
    attacker: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.victim || !formData.attacker) {
      setError('Both victim and attacker must be specified');
      return;
    }

    if (formData.victim === formData.attacker) {
      setError('Victim and attacker cannot be the same person');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.reportOpSecIssue({
        victim: formData.victim,
        attacker: formData.attacker
      });
      
      // Reset form
      setFormData({ victim: '', attacker: '' });
      
      // Notify parent components
      onReportSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to report OpSec issue');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ victim: '', attacker: '' });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-3xl p-8 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <h2 className="title-lg-bold text-emphasis">Report OpSec Issue</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-surfaceTwo hover:bg-fill transition-colors flex items-center justify-center disabled:opacity-50"
          >
            <span className="text-lg text-secondary">×</span>
          </button>
        </div>

        {/* Description */}
        <div className="mb-6 p-4 bg-caution/10 border border-caution/20 rounded-xl">
          <p className="body-sm-normal text-caution">
            <strong>Warning:</strong> This action will transfer <strong>20,000 µPatrons</strong> from the attacker to the victim as a penalty for the OpSec violation.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <UserSearch
            label="Victim"
            placeholder="Search for victim..."
            currentValue={formData.victim}
            onUserSelect={(username) => setFormData({ ...formData, victim: username })}
          />

          <UserSearch
            label="Attacker"
            placeholder="Search for attacker..."
            currentValue={formData.attacker}
            onUserSelect={(username) => setFormData({ ...formData, attacker: username })}
          />

          {error && (
            <div className="bg-critical/10 border border-critical/20 text-critical rounded-xl px-4 py-3 body-sm-normal">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-surfaceTwo text-secondary rounded-xl body-base-semibold hover:bg-fill transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.victim || !formData.attacker}
              className="flex-1 px-6 py-3 bg-critical text-white rounded-xl body-base-semibold hover:bg-critical-hover active:bg-critical-pressed disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Reporting...' : 'Report Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
