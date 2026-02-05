import React from "react";

type AuthShellProps = {
  children: React.ReactNode;
};

export default function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] relative overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 saturate-150"
          style={{ backgroundImage: "url(/brand/mixtape-battle.png)" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--overlay),var(--overlay-strong))]" />
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-16">
        {children}
      </div>
    </div>
  );
}
