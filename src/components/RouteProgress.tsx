"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function RouteProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function start() {
      if (timer.current) clearTimeout(timer.current);
      setDone(false);
      setActive(true);
    }

    window.addEventListener("nile-route-start", start);
    return () => window.removeEventListener("nile-route-start", start);
  }, []);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setActive(true);
      setDone(false);
    }, 0);

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setDone(true);
      setTimeout(() => {
        setActive(false);
        setDone(false);
      }, 240);
    }, 420);

    return () => {
      clearTimeout(startTimer);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [pathname]);

  return (
    <div className={`route-progress ${active ? "active" : ""} ${done ? "done" : ""}`}>
      <span />
    </div>
  );
}
