import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

function DefaultIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="h-10 w-10">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 7.5 12 3 3.75 7.5m16.5 0v9L12 21m8.25-13.5L12 12m0 9-8.25-4.5v-9M12 12 3.75 7.5"
      />
    </svg>
  );
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-text-muted">
        {icon ?? <DefaultIcon />}
      </div>
      <p className="font-medium text-text-primary">{title}</p>
      {description && <p className="max-w-xs text-sm text-text-secondary">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
