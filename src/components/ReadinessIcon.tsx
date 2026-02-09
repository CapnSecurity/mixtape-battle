type ReadinessStatus = "SOLID" | "NEEDS_WORK" | "NOT_READY" | "NONE";

interface ReadinessIconProps {
  status: ReadinessStatus;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  SOLID: { icon: "🟢", label: "Solid" },
  NEEDS_WORK: { icon: "🟡", label: "Needs Work" },
  NOT_READY: { icon: "🔴", label: "Not Ready" },
  NONE: { icon: "⚪", label: "—" },
};

const sizeConfig = {
  sm: { icon: "text-sm", label: "text-xs" },
  md: { icon: "text-base", label: "text-sm" },
  lg: { icon: "text-xl", label: "text-base" },
};

export default function ReadinessIcon({
  status,
  showLabel = true,
  size = "md",
}: ReadinessIconProps) {
  const config = statusConfig[status];
  const sizeClasses = sizeConfig[size];

  return (
    <div className="flex items-center gap-2">
      <span className={sizeClasses.icon}>{config.icon}</span>
      {showLabel && (
        <span className={`${sizeClasses.label} text-[var(--muted)]`}>{config.label}</span>
      )}
    </div>
  );
}
