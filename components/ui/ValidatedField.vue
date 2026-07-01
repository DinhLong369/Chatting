<script setup lang="ts">
import { AlertCircle, CheckCircle2 } from 'lucide-vue-next'

const props = defineProps<{
  label: string
  type?: string
  placeholder?: string
  autocomplete?: string
  error?: string | null
  success?: boolean
  hint?: string
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const fieldId = computed(() => `f-${props.label.replace(/\s+/g, '-').toLowerCase()}`)
const state = computed(() => (props.error ? 'error' : props.success ? 'success' : 'idle'))

const ringClass = computed(() => {
  if (state.value === 'error') return 'border-destructive/60 focus:border-destructive focus:ring-destructive/20'
  if (state.value === 'success') return 'border-emerald-500/60 focus:border-emerald-500 focus:ring-emerald-500/20'
  return 'border-border focus:border-primary focus:ring-primary/15'
})

const showMessage = computed(() => !!props.error || !!props.hint)
</script>

<template>
  <div class="space-y-1.5">
    <label :for="fieldId" class="text-base font-medium text-foreground">{{ label }}</label>
    <div class="relative">
      <input
        :id="fieldId"
        :type="type || 'text'"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :aria-invalid="!!error"
        :value="modelValue"
        :class="[
          'h-12 w-full rounded-xl border bg-card px-4 text-base text-foreground placeholder:text-muted-foreground/70 outline-none transition-all focus:ring-4',
          state !== 'idle' ? 'pr-10' : '',
          ringClass,
        ]"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="emit('blur')"
      />
      <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <AlertCircle v-if="state === 'error'" class="h-4 w-4 text-destructive" />
        <CheckCircle2 v-else-if="state === 'success'" class="h-4 w-4 text-emerald-500" />
      </div>
    </div>
    <div
      :class="[
        'grid overflow-hidden transition-all duration-200 ease-out',
        showMessage ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
      ]"
    >
      <div class="min-h-0">
        <p
          v-if="error"
          :id="`${fieldId}-err`"
          role="alert"
          class="flex items-center gap-1.5 text-sm font-medium text-destructive"
        >
          <AlertCircle class="h-4 w-4 shrink-0" />
          <span>{{ error }}</span>
        </p>
        <p v-else-if="hint" :id="`${fieldId}-hint`" class="text-sm text-muted-foreground">
          {{ hint }}
        </p>
      </div>
    </div>
  </div>
</template>
