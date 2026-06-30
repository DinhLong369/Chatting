<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'

defineProps<{
  title: string
  subtitle: string
}>()
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <!-- Brand panel -->
    <div
      class="relative hidden flex-col justify-between p-12 text-primary-foreground lg:flex"
      :style="{ background: 'var(--gradient-warm)' }"
    >
      <NuxtLink to="/" class="flex items-center gap-2">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <Sparkles class="h-5 w-5" />
        </div>
        <span class="text-lg font-semibold tracking-tight">Glow</span>
      </NuxtLink>
      <div>
        <p class="text-3xl font-medium leading-snug">
          "Mỗi tin nhắn là một sợi nắng — giữ ấm một mối quan hệ."
        </p>
        <p class="mt-4 text-sm opacity-80">— Đội ngũ Glow</p>
      </div>
      <div class="flex gap-1.5">
        <span class="h-1.5 w-8 rounded-full bg-white" />
        <span class="h-1.5 w-3 rounded-full bg-white/40" />
        <span class="h-1.5 w-3 rounded-full bg-white/40" />
      </div>
    </div>

    <!-- Form panel -->
    <div class="flex flex-col" :style="{ background: 'var(--gradient-soft)' }">
      <div class="flex items-center justify-between p-6 lg:hidden">
        <NuxtLink to="/" class="flex items-center gap-2">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground"
            :style="{ background: 'var(--gradient-warm)' }"
          >
            <Sparkles class="h-4 w-4" />
          </div>
          <span class="font-semibold">Glow</span>
        </NuxtLink>
      </div>
      <div class="flex flex-1 items-center justify-center px-6 py-12">
        <div class="w-full max-w-sm">
          <h1 class="text-3xl font-semibold tracking-tight">{{ title }}</h1>
          <p class="mt-2 text-sm text-muted-foreground">{{ subtitle }}</p>
          <div class="mt-8">
            <slot />
          </div>
          <div class="mt-6 text-center text-sm text-muted-foreground">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
