import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  onClose?: () => void;
}

const variantConfig = {
  success: {
    styles: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
    icon: CheckCircle,
  },
  error: {
    styles: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
    icon: AlertCircle,
  },
  warning: {
    styles: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
    icon: AlertTriangle,
  },
  info: {
    styles: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800',
    icon: Info,
  },
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'info', title, onClose, className = '', children, ...props }, ref) => {
    const config = variantConfig[variant];
    const Icon = config.icon;

    return (
      <div
        ref={ref}
        className={`rounded-lg border p-4 ${config.styles} ${className}`}
        role="alert"
        {...props}
      >
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            {title && <h4 className="font-medium mb-1">{title}</h4>}
            <div className="text-sm">{children}</div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  },
);

Alert.displayName = 'Alert';
