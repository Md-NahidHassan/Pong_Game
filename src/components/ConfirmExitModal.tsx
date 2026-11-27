"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmExitModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmExitModal: React.FC<ConfirmExitModalProps> = ({
  onConfirm,
  onCancel,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm Exit to Main Menu"
    >
      <div className="glass-panel w-full max-w-sm rounded-2xl p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10 text-amber-300">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-extrabold tracking-wide text-white">
          EXIT TO MAIN MENU?
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
          Your current match progress and score will be lost.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 transition hover:bg-white/10"
          >
            Resume
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(244,63,94,0.3)] transition hover:brightness-110"
          >
            Exit Match
          </button>
        </div>
      </div>
    </div>
  );
};
