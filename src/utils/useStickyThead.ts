import { useEffect, useRef } from 'react';

/**
 * Keeps a table's <thead> pinned directly underneath the sticky .top-header
 * while the user scrolls down through the table rows, and releases it once
 * the user scrolls past the last item row. Works seamlessly even inside
 * containers with overflow-x: auto or border-radius clipping.
 */
export function useStickyThead<T extends HTMLTableSectionElement>() {
  const theadRef = useRef<T | null>(null);

  useEffect(() => {
    const updateStickyPosition = () => {
      const thead = theadRef.current;
      if (!thead) return;
      const table = thead.closest('table');
      if (!table) return;

      const topHeader = document.querySelector('.top-header');
      const headerBottom = topHeader
        ? Math.max(6, topHeader.getBoundingClientRect().bottom)
        : 6;

      const tableRect = table.getBoundingClientRect();
      const theadHeight = thead.offsetHeight;
      const tfoot = table.querySelector('tfoot');
      const tfootHeight = tfoot ? tfoot.offsetHeight : 0;

      // Maximum vertical offset so the header stops at the last item row
      const maxOffset = Math.max(0, tableRect.height - theadHeight - tfootHeight);
      const rawOffset = headerBottom - tableRect.top;

      if (rawOffset > 0 && rawOffset < maxOffset) {
        thead.style.transform = `translate3d(0, ${rawOffset}px, 0)`;
        thead.classList.add('is-stuck');
      } else if (rawOffset >= maxOffset && maxOffset > 0 && tableRect.bottom > headerBottom) {
        thead.style.transform = `translate3d(0, ${maxOffset}px, 0)`;
        thead.classList.add('is-stuck');
      } else {
        thead.style.transform = 'translate3d(0, 0, 0)';
        thead.classList.remove('is-stuck');
      }
    };

    updateStickyPosition();
    window.addEventListener('scroll', updateStickyPosition, { passive: true });
    window.addEventListener('resize', updateStickyPosition, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateStickyPosition);
      window.removeEventListener('resize', updateStickyPosition);
    };
  }, []);

  return theadRef;
}
