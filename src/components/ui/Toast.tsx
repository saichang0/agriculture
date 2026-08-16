"use client";

interface ToastProps {
  message: string;
  tone?: "success" | "danger" | "info";
}

const toneClasses = {
  success: "bg-success text-white",
  danger: "bg-danger text-white",
  info: "bg-sidebar-bg text-white",
};

function SuccessIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        style={{
          strokeDasharray: 63,
          strokeDashoffset: 63,
          animation: "toast-circle 0.4s ease-out forwards",
        }}
      />
      <path
        d="M7.5 12.5 10.5 15.5 16.5 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{
          strokeDasharray: 14,
          strokeDashoffset: 14,
          animation: "toast-check 0.25s ease-out 0.35s forwards",
        }}
      />
    </svg>
  );
}

export function Toast({ message, tone = "success" }: ToastProps) {
  return (
    <div className="fixed bottom-6 left-1/2 z-1000 -translate-x-1/2">
      <div
        className={`flex items-center gap-2.5 rounded-control px-5 py-3 text-sm font-medium shadow-lg ${toneClasses[tone]}`}
        style={{ animation: "toast-fade-in 0.2s ease-out" }}
      >
        {tone === "success" && <SuccessIcon />}
        {message}
      </div>
    </div>
  );
}
