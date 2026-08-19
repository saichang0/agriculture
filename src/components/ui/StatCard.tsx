interface StatCardProps {
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "danger";
  onClick?: () => void;
  active?: boolean;
}

const toneClasses = {
  default: "bg-surface border-border",
  warning: "bg-warning-bg border-transparent",
  danger: "bg-danger-bg border-transparent",
};

const valueToneClasses = {
  default: "text-text-primary",
  warning: "text-warning",
  danger: "text-danger",
};

export function StatCard({ label, value, tone = "default", onClick, active = false }: StatCardProps) {
  const classes = `flex-1 rounded-card border p-4 text-left ${toneClasses[tone]} ${
    onClick ? "cursor-pointer transition-shadow hover:shadow-md" : ""
  } ${active ? "ring-2 ring-primary" : ""}`;

  const content = (
    <>
      <p className="text-sm text-text-secondary">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${valueToneClasses[tone]}`}>{value}</p>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {content}
      </button>
    );
  }

  return <div className={classes}>{content}</div>;
}
