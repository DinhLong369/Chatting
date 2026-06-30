<template>
  <button
    type="submit"
    class="h-11 w-full rounded-xl text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.01]"
    :style="{ background: 'var(--gradient-warm)', boxShadow: 'var(--shadow-warm)' }"
  >
    <slot />
  </button>
</template>
