<script module lang="ts">
  /**
   * Svelte action: adds "in" class when element enters viewport.
   */
  export function reveal(node: HTMLElement): { destroy: () => void } {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      node.classList.add('in');
      return { destroy: () => {} };
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            node.classList.add('in');
            observer.unobserve(node);
          }
        });
      },
      { threshold: 0.06 }
    );
    observer.observe(node);
    return { destroy() { observer.disconnect(); } };
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';

  /**
   * Global observer: automatically catches ALL .reveal elements in the DOM,
   * including those inside child components. Starts on mount.
   */
  onMount(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Immediately show all reveals if reduced motion
    if (reduce) {
      document.querySelectorAll('.reveal:not(.in)').forEach((el) => el.classList.add('in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
    );

    // Observe all current .reveal elements
    document.querySelectorAll('.reveal:not(.in)').forEach((el) => observer.observe(el));

    // MutationObserver to catch dynamically added .reveal elements
    const mutObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            if (node.classList.contains('reveal') && !node.classList.contains('in')) {
              observer.observe(node);
            }
            node.querySelectorAll?.('.reveal:not(.in)').forEach((el) => observer.observe(el));
          }
        }
      }
    });

    mutObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutObserver.disconnect();
    };
  });
</script>
