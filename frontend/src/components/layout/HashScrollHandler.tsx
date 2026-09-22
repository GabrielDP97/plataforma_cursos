import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * HashScrollHandler — handles smooth scrolling to hash anchors in React Router.
 * 
 * When the URL contains a hash (e.g. /#precios), this component
 * scrolls to the element with that ID after the page renders.
 */
export function HashScrollHandler() {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (!hash) return;

    const id = hash.slice(1); // Remove #
    if (!id) return;

    // Wait for DOM to render after route change
    requestAnimationFrame(() => {
      const element = document.getElementById(id);
      if (element) {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        element.scrollIntoView({
          behavior: prefersReduced ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    });
  }, [location.pathname, location.hash]);

  return null;
}
