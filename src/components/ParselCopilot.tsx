"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useState } from "react";

import { ParselAiFab } from "@/components/copilot/ParselAiFab";
import { PARSEL_COPILOT_OPEN_EVENT } from "@/lib/copilot/copilot-events";

const ParselCopilotPanel = dynamic(
  () =>
    import("@/components/ParselCopilotPanel").then((mod) => mod.ParselCopilotPanel),
  { ssr: false },
);

export function ParselCopilot() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((current) => !current), []);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }

    function onKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggle();
      }
    }

    window.addEventListener(PARSEL_COPILOT_OPEN_EVENT, onOpen);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener(PARSEL_COPILOT_OPEN_EVENT, onOpen);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [toggle]);

  if (!mounted) return null;

  return (
    <>
      {!open ? <ParselAiFab /> : null}
      {open ? (
        <Suspense fallback={null}>
          <ParselCopilotPanel onClose={close} />
        </Suspense>
      ) : null}
    </>
  );
}
