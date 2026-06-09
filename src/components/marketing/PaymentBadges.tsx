import { cn } from "@/lib/utils";

function IyzicoLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 32"
      className={className}
      aria-hidden
      role="img"
    >
      <text
        x="0"
        y="23"
        fill="currentColor"
        fontFamily="system-ui, sans-serif"
        fontSize="22"
        fontWeight="700"
        letterSpacing="-0.5"
      >
        iyzico
      </text>
    </svg>
  );
}

function VisaLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 16" className={className} aria-hidden role="img">
      <path
        fill="#1A1F71"
        d="M19.3 15.5h-3.1L18.1 0.5h3.1L19.3 15.5zm11.2-10.1c-.6-.2-1.6-.5-2.8-.5-3.1 0-5.3 1.6-5.3 4 0 1.7 1.6 2.7 2.8 3.2 1.2.6 1.7 1 1.7 1.5 0 .8-1 1.2-2 1.2-1.3 0-2-.4-2.6-.7l-.4-.2-.4 2.4c.7.3 2 .6 3.3.6 3.3 0 5.4-1.6 5.5-4.1.1-1.4-.9-2.4-2.8-3.2-1.2-.6-1.9-1-1.9-1.6 0-.5.6-1.1 1.9-1.1 1.1 0 1.9.2 2.5.5l.3.1.4-2.3zm8.5-.3h-2.4c-.7 0-1.3.2-1.6 1l-4.5 10.5h3.3l.6-1.7h4.1l.4 1.7h2.9l-2.3-11.5zm-3.8 7.4l1.7-4.6.9 4.6h-2.6zM15.1.5l-3 10.8-.3-1.6c-.6-2-2.5-4.2-4.6-5.3l2.8 10.6h3.3L18.4.5h-3.3zM6.2 0.5H.2L0 1.1C4.5 2.2 7.5 5.2 8.7 8.5L6.2 0.5z"
      />
      <path fill="#1A1F71" d="M46.5 0.5h-2.6L41.2 15.5h2.6l2.7-15z" opacity="0" />
    </svg>
  );
}

function MastercardLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 24" className={className} aria-hidden role="img">
      <circle cx="15" cy="12" r="9" fill="#EB001B" />
      <circle cx="25" cy="12" r="9" fill="#F79E1B" />
      <path
        fill="#FF5F00"
        d="M20 5.8a9 9 0 0 1 0 12.4 9 9 0 0 1 0-12.4z"
      />
    </svg>
  );
}

function TroyLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 56 20" className={className} aria-hidden role="img">
      <rect width="56" height="20" rx="3" fill="#00A0C6" />
      <text
        x="28"
        y="14"
        textAnchor="middle"
        fill="white"
        fontFamily="system-ui, sans-serif"
        fontSize="11"
        fontWeight="800"
        letterSpacing="0.08em"
      >
        TROY
      </text>
    </svg>
  );
}

export function PaymentBadges({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-5", className)}
      aria-label="Ödeme yöntemleri: iyzico, Visa, Mastercard, Troy"
    >
      <IyzicoLogo className="h-5 w-auto text-foreground" />
      <VisaLogo className="h-4 w-auto" />
      <MastercardLogo className="h-6 w-auto" />
      <TroyLogo className="h-5 w-auto" />
    </div>
  );
}
