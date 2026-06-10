import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type GradGatewayLogoProps = {
  href?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  size?: number;
  className?: string;
};

/** Brand mark — uses /logo.svg (purple tile + white G & cap). */
export function GradGatewayLogo({
  href = "/",
  showWordmark = true,
  wordmarkClassName,
  size = 40,
  className,
}: GradGatewayLogoProps) {
  const mark = (
    <Image
      src="/logo.svg"
      alt="GradGateway"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      priority
    />
  );

  const content = (
    <>
      {mark}
      {showWordmark ? (
        <span
          className={cn(
            "font-extrabold tracking-tight text-slate-900",
            wordmarkClassName
          )}
        >
          GradGateway
        </span>
      ) : null}
    </>
  );

  if (!href) {
    return <div className="flex items-center gap-2.5">{content}</div>;
  }

  return (
    <Link href={href} className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
      {content}
    </Link>
  );
}
