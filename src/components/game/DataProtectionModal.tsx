'use client';

import React, { useState, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useSoundFX } from '@/hooks/useSoundFX';
import {
  ShieldCheck,
  Download,
  Upload,
  Trash2,
  X,
  FileText,
  Lock,
  EyeOff,
  ServerOff,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DataProtectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataProtectionModal: React.FC<DataProtectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { exportSaveData, importSaveData, purgeAllData } = useGameStore();
  const { playClick, playCash, playWarning } = useSoundFX();
  const [confirmPurge, setConfirmPurge] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      playCash();
      const jsonStr = exportSaveData();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jigawa-lifestyle-save-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setStatusMsg({ text: 'Save file exported successfully (NDPA / GDPR compliant portability).' });
    } catch {
      setStatusMsg({ text: 'Failed to export save data.', isError: true });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const res = importSaveData(content);
        if (res.success) {
          playCash();
          setStatusMsg({ text: res.message });
        } else {
          playWarning();
          setStatusMsg({ text: res.message, isError: true });
        }
      } catch {
        playWarning();
        setStatusMsg({ text: 'Failed to read file format.', isError: true });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePurge = () => {
    playWarning();
    purgeAllData();
    setConfirmPurge(false);
    setStatusMsg({ text: 'All local data has been permanently deleted from this device.' });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md font-sans">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 25 }}
          className="relative w-full max-w-lg bg-[#0c121e] border-2 border-emerald-500/40 rounded-3xl shadow-2xl flex flex-col text-white overflow-hidden max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-950/60 to-emerald-900/30">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Data Protection & Privacy Policy
                </h3>
                <span className="text-[10px] text-emerald-400/90 font-mono">
                  NDPA 2023 · GDPR Article 13/17/20 Compliance
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                playClick();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-4 h-4 text-white/80" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-white/80 leading-relaxed">
            {/* Status Alert */}
            {statusMsg && (
              <div
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
                  statusMsg.isError
                    ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                    : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                }`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span>{statusMsg.text}</span>
              </div>
            )}

            {/* Core Privacy Guarantees */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-1.5">
                <ServerOff className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-[11px] text-white">0 Remote Servers</span>
                <span className="text-[10px] text-white/50">100% on-device</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-1.5">
                <EyeOff className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-[11px] text-white">0 Trackers / Ads</span>
                <span className="text-[10px] text-white/50">No surveillance</span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center gap-1.5">
                <Lock className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-[11px] text-white">Zero PII Collected</span>
                <span className="text-[10px] text-white/50">Pseudonymous</span>
              </div>
            </div>

            {/* Policy Details */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <span>1. Data Controller & Storage Architecture</span>
              </h4>
              <p className="text-white/70 text-[11px]">
                Under the Nigeria Data Protection Act (NDPA) 2023 and General Data Protection Regulation (GDPR),
                <strong className="text-white"> Jigawa Lifestyle</strong> is engineered as a client-side Web application.
                All game state (Naira, Mutunci, Energy, Wardrobe, Inventory) is saved strictly in your browser’s local storage (<code className="text-emerald-400 font-mono text-[10px]">jigawa-lifestyle-storage</code>).
              </p>
              <p className="text-white/70 text-[11px]">
                No personal data, telemetry events, biometric traits, or device identifiers are ever collected, transmitted, or sold to third parties.
              </p>
            </div>

            {/* User Rights & Controls */}
            <div className="space-y-3 pt-1">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400">
                Data Portability & Erasure Rights
              </h4>

              {/* Export / Portability */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div>
                  <div className="font-bold text-white text-xs">Download Data Record (Portability)</div>
                  <div className="text-[10px] text-white/50">Export your complete game progress as JSON (GDPR Art 20)</div>
                </div>
                <button
                  onClick={handleExport}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs flex items-center gap-1.5 transition shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>

              {/* Import / Restore */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <div>
                  <div className="font-bold text-white text-xs">Restore Data Record</div>
                  <div className="text-[10px] text-white/50">Import a verified save JSON with schema sanitization</div>
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-xs flex items-center gap-1.5 transition shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import</span>
                  </button>
                </div>
              </div>

              {/* Right to Erasure */}
              <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-rose-300 text-xs">Right to Erasure (Purge All Data)</div>
                    <div className="text-[10px] text-white/50">Permanently wipe all stored data on this device (NDPA Sec 34)</div>
                  </div>
                  {!confirmPurge ? (
                    <button
                      onClick={() => setConfirmPurge(true)}
                      className="px-3 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-500/40 font-bold text-xs flex items-center gap-1.5 transition shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Purge</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePurge}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setConfirmPurge(false)}
                        className="px-2 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                {confirmPurge && (
                  <p className="text-[11px] text-rose-300 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Warning: This action will completely erase your save data from browser memory.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] text-white/50">
            <span>Effective: 2026 · Nigeria Data Protection Commission (NDPC)</span>
            <button
              onClick={() => {
                playClick();
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
