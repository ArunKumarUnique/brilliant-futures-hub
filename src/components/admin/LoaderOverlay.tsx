import { Loader2 } from 'lucide-react';

interface LoaderOverlayProps {
  open: boolean;
  message?: string;
}

const LoaderOverlay = ({ open, message = 'Generating document...' }: LoaderOverlayProps) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] bg-background/70 backdrop-blur-sm flex items-center justify-center"
      // Block clicks
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
      role="dialog"
      aria-modal="true"
      aria-busy="true"
    >
      <div className="bg-card border border-border rounded-xl shadow-lg px-6 py-5 flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span className="text-sm font-medium text-foreground">{message}</span>
      </div>
    </div>
  );
};

export default LoaderOverlay;
