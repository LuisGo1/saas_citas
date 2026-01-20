"use client";

import { AlertTriangle, Wifi, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ErrorDisplayProps {
  error: string | Error | null;
  type?: 'error' | 'warning' | 'network' | 'validation';
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export default function ErrorDisplay({
  error,
  type = 'error',
  onRetry,
  onDismiss,
  className
}: ErrorDisplayProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!error || !isVisible) return null;

  const errorMessage = error instanceof Error ? error.message : error;

  const getIcon = () => {
    switch (type) {
      case 'network':
        return <Wifi className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'network':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/20',
          text: 'text-orange-400',
          icon: 'text-orange-500'
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          text: 'text-amber-400',
          icon: 'text-amber-500'
        };
      case 'validation':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          text: 'text-red-400',
          icon: 'text-red-500'
        };
      default:
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          text: 'text-red-400',
          icon: 'text-red-500'
        };
    }
  };

  const colors = getColors();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div className={cn(
      "rounded-xl border p-4 flex items-start gap-3",
      colors.bg,
      colors.border,
      className
    )}>
      <div className={cn("flex-shrink-0 mt-0.5", colors.icon)}>
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", colors.text)}>
          {errorMessage}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {onRetry && (
          <button
            onClick={handleRetry}
            className={cn(
              "p-1.5 rounded-lg transition-colors hover:bg-white/10",
              colors.icon
            )}
            title="Reintentar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {onDismiss && (
          <button
            onClick={handleDismiss}
            className={cn(
              "p-1.5 rounded-lg transition-colors hover:bg-white/10",
              colors.icon
            )}
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}