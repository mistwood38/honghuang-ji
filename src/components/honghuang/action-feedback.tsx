import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

const ActionContext = createContext({
  pending: "",
  run: (_id: string, _action: () => void) => {},
});

/** One lock for the whole reading surface, including keyboard choices. */
export function ActionFeedback({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState("");
  const locked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function run(id: string, action: () => void) {
    if (locked.current) return;
    locked.current = true;
    setPending(id);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(
      () => {
        try {
          action();
        } finally {
          locked.current = false;
          setPending("");
          timer.current = null;
        }
      },
      reduced ? 0 : 200,
    );
  }
  return <ActionContext.Provider value={{ pending, run }}>{children}</ActionContext.Provider>;
}

// Kept with its provider because the lock is private to this presentation layer.
// eslint-disable-next-line react-refresh/only-export-components
export function useActionFeedback() {
  return useContext(ActionContext);
}
