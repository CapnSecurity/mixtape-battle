import React from "react";

type ButtonVariant = "primary" | "surface" | "ghost";
type ButtonSize = "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
};

export default function Button({
  variant = "primary",
  size = "md",
  asChild = false,
  className = "",
  type,
  children,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:opacity-60 disabled:cursor-not-allowed";

  const sizeClass =
    size === "lg" ? "px-5 py-3 text-base" : "px-4 py-2.5 text-sm";

  const variantClass =
    variant === "primary"
      ? "bg-[linear-gradient(135deg,var(--gold),var(--pink))] text-[var(--bg)] shadow-[var(--shadow)] hover:brightness-110 active:brightness-95"
      : variant === "surface"
      ? "bg-[var(--surface2)] text-[var(--text)] border border-[var(--ring)]/20 shadow-[var(--shadow)] hover:bg-[var(--surface)]"
      : "bg-transparent text-[var(--text)] border border-[var(--ring)]/30 hover:bg-[var(--surface2)]";

  const classes = [base, sizeClass, variantClass, className]
    .filter(Boolean)
    .join(" ");

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;
    return React.cloneElement(child, {
      className: [classes, child.props?.className].filter(Boolean).join(" "),
      ...rest,
    });
  }

  return (
    <button type={type || "button"} className={classes} {...rest}>
      {children}
    </button>
  );
}
