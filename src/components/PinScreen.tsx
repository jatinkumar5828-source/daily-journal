import React, { useState } from 'react';
import { verifyPin } from '../services/security';
import { Lock, Delete, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';

interface PinScreenProps {
  pinHash: string;
  onUnlockSuccess: () => void;
}

export const PinScreen: React.FC<PinScreenProps> = ({ pinHash, onUnlockSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 8) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      // Auto-submit if reaches 4 digits and matches
      if (nextPin.length >= 4) {
        verifyPin(nextPin, pinHash).then((isValid) => {
          if (isValid) {
            onUnlockSuccess();
          }
        });
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await verifyPin(pin, pinHash);
    if (isValid) {
      onUnlockSuccess();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-100 dark:bg-stone-950 flex flex-col items-center justify-center p-4 selection:bg-none">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* Brand Lock Icon */}
        <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4 shadow-sm border border-amber-200/60 dark:border-amber-900/40">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 font-serif mb-1">
          LifeDiary is Locked
        </h2>
        <p className="text-xs text-stone-500 mb-6">
          Enter your security PIN to access your personal journal
        </p>

        {/* PIN Dots Display */}
        <div className="flex items-center gap-3 mb-6">
          {[0, 1, 2, 3].map((idx) => {
            const hasValue = idx < pin.length;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  error
                    ? 'bg-rose-500 scale-110'
                    : hasValue
                    ? 'bg-amber-600 dark:bg-amber-500 scale-110'
                    : 'bg-stone-300 dark:bg-stone-700'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="flex items-center gap-1 text-xs text-rose-500 mb-4 animate-shake">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Incorrect PIN. Please try again.</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-64 mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="h-14 rounded-2xl bg-white dark:bg-stone-900 text-lg font-semibold text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-95 transition-all shadow-2xs"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin('')}
            className="h-14 rounded-2xl text-xs font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center justify-center"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-white dark:bg-stone-900 text-lg font-semibold text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 active:scale-95 transition-all shadow-2xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-14 rounded-2xl text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-800 flex items-center justify-center transition-colors"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Fallback keyboard input form for accessibility & password managers */}
        <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
          <input
            type="password"
            maxLength={8}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Type PIN here..."
            className="w-36 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center text-stone-800 dark:text-stone-200"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
