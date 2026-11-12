/** Only used following an explicit action, never a store subscription or idle tick. */
export function focusReadingTarget(target: HTMLElement | null) {
  if (!target) return;
  const header = document.querySelector(".game-header")?.getBoundingClientRect().bottom ?? 0;
  const viewport = window.visualViewport;
  const viewportTop = Math.max(0, viewport?.offsetTop ?? 0);
  const viewportBottom = viewportTop + Math.max(0, viewport?.height ?? window.innerHeight);
  const bottom = Math.max(
    viewportTop,
    Math.min(
      document.querySelector(".dock")?.getBoundingClientRect().top ?? viewportBottom,
      viewportBottom,
    ),
  );
  const readingTop = Math.min(bottom, Math.max(header, viewportTop) + 12);
  const available = bottom - readingTop;
  const { top, height } = target.getBoundingClientRect();
  // Reveal short responses in full; longer passages get most of the reading area.
  const readingSpace = Math.min(Math.max(0, height), available * 0.65);
  const visibleTop = Math.max(readingTop, Math.min(top, bottom - readingSpace));
  if (available > 0 && Math.abs(top - visibleTop) > 1)
    window.scrollBy({ top: top - visibleTop, behavior: "instant" });
  target.focus({ preventScroll: true });
}
