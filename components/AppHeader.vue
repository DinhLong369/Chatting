<script setup lang="ts">
import { MessageCircle, Sparkles } from 'lucide-vue-next'
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
    <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 sm:h-16 sm:px-6">
      <NuxtLink to="/" class="flex items-center gap-2">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-xl text-primary-foreground sm:h-9 sm:w-9"
          :style="{ background: 'var(--gradient-warm)' }"
        >
          <Sparkles class="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <span class="text-lg font-semibold tracking-tight sm:text-xl">Logea</span>
      </NuxtLink>
      <nav class="flex items-center gap-0.5 text-base sm:gap-1">
        <!-- Tin nhắn: chỉ icon trên mobile -->
        <!-- <NuxtLink
          to="/messages"
          class="inline-flex items-center gap-1.5 rounded-full p-2 font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:px-3 sm:py-2"
        >
          <MessageCircle class="h-5 w-5" />
          <span class="hidden sm:inline">Tin nhắn</span>
        </NuxtLink> -->
        <!-- Đăng nhập: ẩn trên mobile -->
        <NuxtLink
          to="/login"
          class="hidden rounded-full px-4 py-2 font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
        >
          Đăng nhập
        </NuxtLink>
        <NuxtLink
          to="/register"
          class="rounded-full px-3 py-1.5 text-base font-medium text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] sm:px-4 sm:py-2"
          :style="{ background: 'var(--gradient-warm)' }"
        >
          Đăng ký
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
