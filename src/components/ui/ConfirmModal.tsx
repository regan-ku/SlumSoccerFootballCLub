"use client";

import { AlertTriangle, X, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  isDestructive = false,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isDestructive ? 'bg-red-500/10' : 'bg-accent/10'}`}>
              <AlertTriangle className={`w-5 h-5 ${isDestructive ? 'text-red-500' : 'text-accent'}`} />
            </div>
            <h3 className="font-heading text-xl font-bold uppercase text-foreground">{title}</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" disabled={isLoading}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          {description}
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-2 ${
              isDestructive 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-accent text-accent-foreground hover:bg-accent/90'
            }`}
          >
            {isLoading ? <><Loader2 className="w-3 h-3 animate-spin" /> Processing...</> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}