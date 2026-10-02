import React, { useRef, useState } from 'react';
import { exportJournalJSON, importJournalJSON } from '../services/storage';
import {
  X,
  Download,
  Upload,
  Printer,
  Bell,
  CheckCircle,
  AlertTriangle,
  FileJson,
} from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
  onPrintCurrentEntry: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
  onPrintCurrentEntry,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [notificationState, setNotificationState] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      const json = await exportJournalJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifediary-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage({ type: 'success', text: 'Backup downloaded successfully.' });
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to export backup.' });
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmed = window.confirm(
      'Importing will restore entries from your backup file into this device. Continue?'
    );
    if (!confirmed) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      const text = await file.text();
      const result = await importJournalJSON(text);

      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: `Successfully restored ${result.importedCount} journal entries!`,
        });
        onDataRestored();
      } else {
        setStatusMessage({
          type: 'error',
          text: result.error || 'Failed to import journal entries.',
        });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Could not read backup file.' });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Notifications are not supported in this browser.');
      return;
    }
    const perm = await Notification.requestPermission();
    setNotificationState(perm);
    if (perm === 'granted') {
      new Notification('LifeDiary Reminders Active', {
        body: "We'll remind you to record your daily life reflections!",
        icon: '/favicon.ico',
      });
      setStatusMessage({ type: 'success', text: 'Daily reminders enabled!' });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-7 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Backup, Restore & Export
              </h3>
              <p className="text-xs text-stone-500">Safeguard and transfer your journal data</p>
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

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Export Section */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <FileJson className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Export Journal (JSON)</span>
              </h4>
              <p className="text-2xs text-stone-500 dark:text-stone-400">
                Download all your entries, photos, and reflections into a single offline file.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 transition-colors whitespace-nowrap shrink-0 ml-3"
            >
              Export JSON
            </button>
          </div>

          {/* Import Section */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-500" />
                <span>Import Journal</span>
              </h4>
              <p className="text-2xs text-stone-500 dark:text-stone-400">
                Restore or migrate your life diary entries from a previous JSON backup.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-stone-100 text-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-200 border border-stone-300 dark:border-stone-700 transition-colors whitespace-nowrap shrink-0 ml-3"
            >
              Import File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>

          {/* Print / PDF Section */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-emerald-500" />
                <span>Export as PDF / Print</span>
              </h4>
              <p className="text-2xs text-stone-500 dark:text-stone-400">
                Format the current diary page for clean document printing or Save as PDF.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onPrintCurrentEntry();
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-200/80 hover:bg-stone-300/80 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 transition-colors whitespace-nowrap shrink-0 ml-3"
            >
              Print / PDF
            </button>
          </div>

          {/* Daily Reminder Notification */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-purple-500" />
                <span>Daily Writing Reminder</span>
              </h4>
              <p className="text-2xs text-stone-500 dark:text-stone-400">
                "Have you written about your day?" Optional browser notification.
              </p>
            </div>
            <button
              type="button"
              onClick={requestNotificationPermission}
              disabled={notificationState === 'granted'}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ml-3 ${
                notificationState === 'granted'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-stone-200 hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200'
              }`}
            >
              {notificationState === 'granted' ? 'Enabled ✓' : 'Enable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
