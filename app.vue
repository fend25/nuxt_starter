<script setup lang="ts">
import {getSharedData, useInit} from '~/composables/_init'
import {Locale} from '#cookie-control/types'

const i18n = useI18n()

await useInit()
const locale = getSharedData().defaultLocale.value as Locale
await i18n.setLocale(locale)
</script>

<template>
  <NuxtLayout>
    <NuxtPage/>
  </NuxtLayout>
  <CookieControl :locale="locale" />
</template>
