<script module lang="ts">
  /**
   * Svelte action that adds the "in" class when the element enters the viewport.
   * Respects prefers-reduced-motion by adding "in" immediately.
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

    return {
      destroy() {
        observer.disconnect();
      }
    };
  }
</script>

<script lang="ts">
  let { children }: { children: import('svelte').Snippet } = $props();
</script>

<div class="reveal" use:reveal>
  {@render children()}
</div>
