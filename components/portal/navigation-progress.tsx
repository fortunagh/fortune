"use client";

import { usePathname, useSearchParams } from "next/navigation";
import * as React from "react";
import { createContext, useContext } from "react";

type NavProgressApi = {
  start: () => void;
  done: () => void;
};

const NavProgressContext = createContext<NavProgressApi>({
  start: () => {},
  done: () => {},
});

export function useNavProgress() {
  return useContext(NavProgressContext);
}

export function NavigationProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = React.useState(false);
  const [width, setWidth] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = React.useCallback(() => {
    clearTimer();
    setActive(true);
    setWidth(12);
    timerRef.current = setInterval(() => {
      setWidth((w) => {
        if (w >= 88) return w;
        return w + Math.max(1, (90 - w) * 0.08);
      });
    }, 120);
  }, [clearTimer]);

  const done = React.useCallback(() => {
    clearTimer();
    setWidth(100);
    window.setTimeout(() => {
      setActive(false);
      setWidth(0);
    }, 220);
  }, [clearTimer]);

  React.useEffect(() => {
    done();
    // Complete when the route has painted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString()]);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          return;
        }
        start();
      } catch {
        /* ignore */
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start]);

  const api = React.useMemo(() => ({ start, done }), [start, done]);

  return (
    <NavProgressContext.Provider value={api}>
      <div
        aria-hidden={!active}
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]"
      >
        <div
          className="h-full bg-[#c59d3f] transition-[width,opacity] duration-200 ease-out"
          style={{
            width: `${width}%`,
            opacity: active ? 1 : 0,
          }}
        />
      </div>
      {children}
    </NavProgressContext.Provider>
  );
}
