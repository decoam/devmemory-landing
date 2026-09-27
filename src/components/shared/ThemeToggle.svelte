<script lang="ts">
  import { Sun, Moon } from 'lucide-svelte';
  
  let theme: 'neoLight' | 'neoDark' = 'neoLight';

  function toggleTheme() {
    theme = theme === 'neoLight' ? 'neoDark' : 'neoLight';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('theme') as 'neoLight' | 'neoDark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    theme = savedTheme || (prefersDark ? 'neoDark' : 'neoLight');
    document.documentElement.setAttribute('data-theme', theme);
  }

  if (typeof window !== 'undefined') {
    initTheme();
  }
</script>

<div class="flex items-center">
  <button
    on:click={toggleTheme}
    class="toggle-btn rounded-sm relative flex items-center gap-2 border-2 p-2 transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
    class:is-dark={theme === 'neoDark'}
    class:is-light={theme === 'neoLight'}
    aria-label="Toggle theme"
  >
    <Sun size={18} strokeWidth={2.5} class={theme === 'neoLight' ? 'text-warning' : 'text-white/40'} />
    <div class="h-4 w-[2px] {theme === 'neoDark' ? 'bg-white/30' : 'bg-[#1D1D1F]/30'}" />
    <Moon size={18} strokeWidth={2.5} class={theme === 'neoDark' ? 'text-info' : 'text-[#1D1D1F]/40'} />
  </button>
</div>

<style>
  .toggle-btn.is-light {
    background-color: var(--bg-card-main);
    border-color: var(--border-color);
    box-shadow: 3px 3px 0px 0px var(--shadow-color);
  }

  .toggle-btn.is-dark {
    background-color: var(--bg-card-main);
    border-color: var(--border-color);
    box-shadow: 3px 3px 0px 0px var(--shadow-color);
  }

  .toggle-btn:active {
    box-shadow: 0px 0px 0px 0px !important;
  }
</style>