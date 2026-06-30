<script setup lang="ts">
import { MessageCircle, Sparkles } from 'lucide-vue-next'
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
      <NuxtLink to="/" class="flex items-center gap-2">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground"
          :style="{ background: 'var(--gradient-warm)' }"
        >
          <Sparkles class="h-5 w-5" />
        </div>
        <span class="text-lg font-semibold tracking-tight">Glow</span>
      </NuxtLink>
      <nav class="flex items-center gap-1 text-sm">
        <NuxtLink
          to="/messages"
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <MessageCircle class="h-4 w-4" /> Tin nhắn
        </NuxtLink>
        <NuxtLink
          to="/login"
          class="rounded-full px-4 py-2 font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Đăng nhập
        </NuxtLink>
        <NuxtLink
          to="/register"
          class="rounded-full px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-transform hover:scale-[1.02]"
          :style="{ background: 'var(--gradient-warm)' }"
        >
          Đăng ký
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
