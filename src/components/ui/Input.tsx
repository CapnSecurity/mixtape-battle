import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...rest }, ref) => {
    const classes = [
      "w-full rounded-xl bg-[var(--surface2)] text-[var(--text)] placeholder:text-[var(--muted)] border border-[var(--ring)]/20 px-4 py-3 transition",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:border-[var(--ring)]",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return <input ref={ref} className={classes} {...rest} />;
  }
);

Input.displayName = "Input";

export default Input;
