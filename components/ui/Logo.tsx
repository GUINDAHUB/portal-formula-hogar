import Image from "next/image";

type LogoVariant = "light" | "dark";

export function Logo({
  variant = "light",
  className = "",
}: {
  variant?: LogoVariant;
  className?: string;
}) {
  const isDarkBg = variant === "dark";
  const src = isDarkBg
    ? "/brand/logo-negative-header.png"
    : "/brand/logo-color-header.png";
  const renderedWidthPx = 176;

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src={src}
        alt="FórmulaHogar"
        width={880}
        height={220}
        priority
        sizes={`${renderedWidthPx}px`}
        className="h-11 w-auto"
      />
    </div>
  );
}
