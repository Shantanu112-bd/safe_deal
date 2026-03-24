"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { monitor } from "@/lib/monitoring";

export function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    monitor.pageView(window.location.pathname);
  }, [pathname]);

  return null;
}
