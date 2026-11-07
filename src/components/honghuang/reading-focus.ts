/** Only used following an explicit action, never a store subscription or idle tick. */
export function focusReadingTarget(target: HTMLElement | null) {
  if (!target) return;
  const header = document.querySelector(".game-header")?.getBoundingClientRect().bottom ?? 0;
  const viewportBottom = window.visualViewport
    ? window.visualViewport.offsetTop + window.visualViewport.height
    : innerHeight;
  const bottom = Math.min(
    document.querySelector(".dock")?.getBoundingClientRect().top ?? viewportBottom,
    viewportBottom,
  );
  const top = target.getBoundingClientRect().top;
  const visibleTop = Math.max(header + 12, Math.min(top, bottom - 150));
  if (Math.abs(top - visibleTop) > 1)
    window.scrollBy({ top: top - visibleTop, behavior: "instant" });
  target.focus({ preventScroll: true });
}
