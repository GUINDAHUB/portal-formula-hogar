import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-near-black font-bold shadow-[0_10px_28px_rgba(191,255,0,0.35)] hover:brightness-95 hover:shadow-[0_14px_34px_rgba(191,255,0,0.45)] active:brightness-90",
  secondary:
    "border border-near-black/20 bg-white text-near-black hover:border-near-black/35 hover:bg-near-black/[0.03]",
  ghost: "border border-transparent text-near-black hover:bg-near-black/[0.05]",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-btn px-6 py-3 font-body text-[15px] font-bold tracking-tight transition duration-200 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
