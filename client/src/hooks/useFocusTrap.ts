import { useEffect, type RefObject } from "react";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

function focusableElements(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(focusableSelector)].filter((element) => {
    return !element.hasAttribute("disabled") && element.tabIndex !== -1;
  });
}

export function useFocusTrap(containerRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const current = containerRef.current;
    if (current === null) {
      return;
    }
    const container: HTMLElement = current;

    const previouslyFocused = document.activeElement;

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Tab") {
        return;
      }

      const items = focusableElements(container);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      if (first === undefined || last === undefined) {
        return;
      }

      const active = document.activeElement;
      const outside = !(active instanceof Node) || !container.contains(active);

      if (event.shiftKey && (active === first || outside)) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && (active === last || outside)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    const preferred = container.querySelector<HTMLElement>("[autofocus]");
    const initial = preferred ?? focusableElements(container)[0];
    initial?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [containerRef]);
}
