interface StatCardProps {
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "danger";
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

export function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <div className={`flex-1 rounded-card border p-4 ${toneClasses[tone]}`}>
      <p className="text-sm text-text-secondary">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${valueToneClasses[tone]}`}>{value}</p>
    </div>
  );
}
