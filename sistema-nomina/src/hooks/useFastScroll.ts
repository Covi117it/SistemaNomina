import { useEffect } from 'react';

/**
 * Acelera la velocidad de la rueda del ratón en toda la aplicación (Tauri / WebKitGTK).
 * @param multiplier Factor de aceleración (ej. 2.2 = 220% de la velocidad estándar)
 */
export function useFastScroll(multiplier: number = 2.2) {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Ignorar si se presionan teclas como Ctrl (zoom) o Alt
      if (e.ctrlKey || e.altKey) return;

      const extraFactor = multiplier - 1;
      if (extraFactor <= 0) return;

      let target = e.target as HTMLElement | null;
      let scrollableEl: HTMLElement | null = null;
      let canScrollY = false;
      let canScrollX = false;

      while (target && target !== document.body && target !== document.documentElement) {
        const style = window.getComputedStyle(target);
        const isScrollableY =
          (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
          target.scrollHeight > target.clientHeight;
        const isScrollableX =
          (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
          target.scrollWidth > target.clientWidth;

        const hasRoomY =
          isScrollableY &&
          ((e.deltaY > 0 && target.scrollTop + target.clientHeight < target.scrollHeight - 1) ||
            (e.deltaY < 0 && target.scrollTop > 1));

        const hasRoomX =
          isScrollableX &&
          ((e.deltaX > 0 && target.scrollLeft + target.clientWidth < target.scrollWidth - 1) ||
            (e.deltaX < 0 && target.scrollLeft > 1));

        if (hasRoomY || hasRoomX) {
          scrollableEl = target;
          canScrollY = hasRoomY;
          canScrollX = hasRoomX;
          break;
        }
        target = target.parentElement;
      }

      if (scrollableEl) {
        if (canScrollY && e.deltaY) {
          scrollableEl.scrollTop += e.deltaY * extraFactor;
        }
        if (canScrollX && e.deltaX) {
          scrollableEl.scrollLeft += e.deltaX * extraFactor;
        }
      } else {
        window.scrollBy(e.deltaX * extraFactor, e.deltaY * extraFactor);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [multiplier]);
}
