"use client";



import Link from "next/link";

import { usePathname } from "next/navigation";



import { Logo } from "@/components/ui/Logo";

import {

  dashboardFooterNavItems,

  getDashboardNavGroups,

  isNavItemActive,

  mobileQuickNavItems,

  type DashboardNavItem,

} from "@/lib/dashboard-nav";

import { cn } from "@/lib/utils";



type SidebarNavProps = {

  onNavigate?: () => void;

  className?: string;

  showBrokerOfficeNav?: boolean;

};



function NavLink({

  href,

  label,

  icon: Icon,

  active,

  onNavigate,

  className,

}: {

  href: string;

  label: string;

  icon: DashboardNavItem["icon"];

  active: boolean;

  onNavigate?: () => void;

  className?: string;

}) {

  return (

    <Link

      href={href}

      prefetch={false}

      onClick={onNavigate}

      aria-current={active ? "page" : undefined}

      className={cn(

        "group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all duration-200",

        active

          ? "border-primary/35 bg-accent font-semibold text-accent-foreground shadow-[inset_3px_0_0_0_var(--primary)] dark:border-parsel-gold/25 dark:bg-parsel-gold/10 dark:text-foreground"

          : "border-transparent font-medium text-muted-foreground hover:border-border/60 hover:bg-muted/70 hover:text-foreground dark:hover:bg-white/[0.04]",

        className,

      )}

    >

      <Icon

        className={cn(

          "size-[18px] shrink-0 transition-colors",

          active

            ? "text-primary dark:text-parsel-gold"

            : "text-muted-foreground group-hover:text-foreground",

        )}

        strokeWidth={active ? 2.25 : 1.85}

      />

      <span className="leading-snug">{label}</span>

    </Link>

  );

}



export function SidebarNav({ onNavigate, className, showBrokerOfficeNav = false }: SidebarNavProps) {

  const pathname = usePathname();

  const isMobileSheet = Boolean(onNavigate);

  const dashboardNavGroups = getDashboardNavGroups({ showBrokerOfficeNav });



  return (

    <div className={cn("flex h-full flex-col", className)}>

      <div className="flex h-16 shrink-0 items-center border-b border-border/40 px-5">

        <Link

          href="/dashboard"

          onClick={onNavigate}

          className="inline-flex transition-opacity hover:opacity-90"

          aria-label="ParselOS ana sayfa"

        >

          <Logo className="h-[2.375rem] w-auto max-w-[148px]" />

        </Link>

      </div>



      {isMobileSheet ? (

        <div className="shrink-0 space-y-2 border-b border-border/40 px-3 py-3">

          {mobileQuickNavItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              prefetch={false}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-primary/25 bg-accent/80 px-4 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent",
                isNavItemActive(pathname, href) &&
                  "border-primary/40 shadow-[inset_3px_0_0_0_var(--primary)]",
              )}
            >
              <Icon className="size-5 shrink-0 text-primary" strokeWidth={2} />
              <span>
                {label}
                <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                  Sesli not ekle
                </span>
              </span>
            </Link>
          ))}

        </div>

      ) : null}



      <nav className="custom-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3">

        {dashboardNavGroups.map((group) => (

          <div key={group.label}>

            <p className="parsel-nav-group-label">{group.label}</p>

            <div className="flex flex-col gap-0.5">

              {group.items.map(({ label, href, icon }) => (

                <NavLink

                  key={href}

                  href={href}

                  label={label}

                  icon={icon}

                  active={isNavItemActive(pathname, href)}

                  onNavigate={onNavigate}

                />

              ))}

            </div>

          </div>

        ))}

      </nav>



      <div className="shrink-0 space-y-2 border-t border-border/50 bg-parsel-sunken/30 px-3 py-4 dark:bg-black/20">

        {dashboardFooterNavItems.map(({ label, href, icon }) => (

          <NavLink

            key={href}

            href={href}

            label={label}

            icon={icon}

            active={isNavItemActive(pathname, href)}

            onNavigate={onNavigate}

          />

        ))}

        <p className="px-2 text-2xs leading-relaxed text-muted-foreground">

          Gayrimenkul operasyonları · ParselOS

        </p>

      </div>

    </div>

  );

}


