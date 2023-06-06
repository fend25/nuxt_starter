<script setup lang="ts">
import { useMainStore } from '~/stores/main.store'
import { SUPPORTED_LOCALES } from '~/translations/supportedLocales'
import { useToast } from '~/composables/useToast'

const { user } = useMainStore()

const { $client } = useNuxtApp()

const i18n = useI18n()

const toast = useToast()

const setLocale = async (locale: string) => {
  try {
    if (SUPPORTED_LOCALES.includes(locale)) {
      const result = await $client.saveSettings.mutate({ locale })
      await i18n.setLocale(locale)
      toast.success(i18n.t('settings.settingsSaved'))
    }
  } catch (e: any) {
    console.error(e)
    toast.error(e.message)
  }
}
</script>

<template>
  <p>{{ $t('common.settings') }}</p>
  <template v-for="locale in SUPPORTED_LOCALES">
    <button class="btn btn-outline-primary me-3"
            :class="{'btn-outline-success': locale === i18n.locale.value}"
            :disabled="locale === i18n.locale.value"
            @click="setLocale(locale)"
    >{{ locale }}
    </button>
  </template>
</template>

<style lang="scss" scoped>

</style>

<script lang="ts">
export default {
  name: 'settings'
}
</script>
