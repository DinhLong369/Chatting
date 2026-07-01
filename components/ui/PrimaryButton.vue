<script setup lang="ts">
defineProps<{ disabled?: boolean }>()
</script>

<template>
  <button
    type="submit"
    :disabled="disabled"
    class="h-12 w-full rounded-xl text-base font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
    :style="{ background: 'var(--gradient-warm)', boxShadow: 'var(--shadow-warm)' }"
  >
    <slot />
  </button>
</template>
