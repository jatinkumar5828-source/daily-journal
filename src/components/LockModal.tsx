import React, { useState } from 'react';
import { hashPin, verifyPin } from '../services/security';
import { Lock, Unlock, X, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';

interface LockModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasPin: boolean;
  currentPinHash: string | null;
  onSavePin: (pinHash: string | null) => void;
  onLockNow: () => void;
}

export const LockModal: React.FC<LockModalProps> = ({
  isOpen,
  onClose,
  hasPin,
  currentPinHash,
  onSavePin,
  onLockNow,
}) => {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [oldPin, setOldPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSetOrChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (hasPin && currentPinHash) {
      const isValid = await verifyPin(oldPin, currentPinHash);
      if (!isValid) {
        setError('Current PIN is incorrect.');
        return;
      }
    }

    if (newPin.length < 4 || newPin.length > 8) {
      setError('PIN must be between 4 and 8 digits.');
      return;
    }

    if (newPin !== confirmPin) {
      setError('New PINs do not match.');
      return;
    }

    const hashed = await hashPin(newPin);
    onSavePin(hashed);
    setSuccess(hasPin ? 'PIN updated successfully!' : 'Security PIN created successfully!');
    setNewPin('');
    setConfirmPin('');
    setOldPin('');
  };

  const handleRemovePin = async () => {
    if (!currentPinHash) return;
    const input = prompt('Enter your current PIN to remove protection:');
    if (!input) return;

    const isValid = await verifyPin(input, currentPinHash);
    if (!isValid) {
      alert('Incorrect PIN.');
      return;
    }

    onSavePin(null);
    setSuccess('PIN protection removed.');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-7 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Journal Privacy & PIN
              </h3>
              <p className="text-xs text-stone-500">
                Browser-side SHA-256 hashed protection
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Lock Now Button if PIN is set */}
        {hasPin && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                Protection is Active
              </span>
              <p className="text-2xs text-stone-500 dark:text-stone-400">
                Lock your screen when stepping away.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onLockNow();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:opacity-90 transition-opacity"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Now</span>
            </button>
          </div>
        )}

        {/* Set / Change Form */}
        <form onSubmit={handleSetOrChangePin} className="space-y-3">
          {hasPin && (
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-1">
                Current PIN
              </label>
              <input
                type="password"
                maxLength={8}
                inputMode="numeric"
                pattern="[0-9]*"
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                placeholder="Enter current PIN"
                className="w-full px-3 py-2 text-sm rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-1">
              {hasPin ? 'New PIN (4-8 digits)' : 'Create 4-8 Digit PIN'}
            </label>
            <input
              type="password"
              maxLength={8}
              inputMode="numeric"
              pattern="[0-9]*"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="e.g. 1234"
              className="w-full px-3 py-2 text-sm rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-1">
              Confirm PIN
            </label>
            <input
              type="password"
              maxLength={8}
              inputMode="numeric"
              pattern="[0-9]*"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="Confirm new PIN"
              className="w-full px-3 py-2 text-sm rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            {hasPin && (
              <button
                type="button"
                onClick={handleRemovePin}
                className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium"
              >
                Remove PIN
              </button>
            )}

            <button
              type="submit"
              className="ml-auto px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{hasPin ? 'Update PIN' : 'Save PIN'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
