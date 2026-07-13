import type { BtnProps } from "./types";

const sizeClass = {
  sm: "py-2 px-3.5 text-[13px]",
  md: "py-[11px] px-5 text-sm",
  lg: "py-[14px] px-[26px] text-[15px]",
} as const;

const variantClass = {
  primary:   "bg-apex-voltage hover:bg-apex-voltage-ink text-white border border-transparent",
  ghostDark: "bg-transparent hover:bg-white/[0.06] text-white border border-white/[0.22] hover:border-white/[0.45]",
  outline:   "bg-transparent hover:bg-apex-voltage-soft text-apex-voltage border border-apex-voltage/35 hover:border-apex-voltage",
  quiet:     "bg-transparent hover:bg-apex-paper text-apex-ink border border-apex-line",
} as const;

export function Btn({ variant = "primary", size = "md", icon: Icon, children, onClick, ariaLabel, type = "button", fullWidth }: BtnProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`av-focus inline-flex items-center justify-center gap-2 font-semibold font-body cursor-pointer whitespace-nowrap rounded-[10px] transition-all duration-150 ${sizeClass[size]} ${variantClass[variant]}${fullWidth ? " w-full" : ""}`}
    >
      {children}
      {Icon && <Icon size={16} strokeWidth={2} />}
    </button>
  );
}
