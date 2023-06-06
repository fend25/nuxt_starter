// https://nuxt.com/docs/api/configuration/nuxt-config
import { Locale } from '@dargmuesli/nuxt-cookie-control/dist/runtime/types'
import {SUPPORTED_LOCALES} from './translations/supportedLocales'

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@dargmuesli/nuxt-cookie-control',
  ],
  build: {
    transpile: [
      'trpc-nuxt',
    ]
  },
  typescript: {
    shim: false
  },
  css: [
    '~/assets/styles/main.scss'
  ],
  runtimeConfig: {
    auth : {
      google: {
        clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
        clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
        callbackUrl: process.env.AUTH_GOOGLE_CALLBACK_URL,
      },
    },
    minio: {
      endpoint: process.env.MINIO_ENDPOINT,
      bucketName: process.env.MINIO_BUCKET_NAME,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    },
    files: {
      maxFileSize: +(process.env.FILES_MAX_FILE_SIZE || '') || 1024 * 1024 * 10,
      maxFiles: +(process.env.FILES_MAX_FILES || '') || 10,
    },
  },
  cookieControl: {
    locales: SUPPORTED_LOCALES as Locale[],
    localeTexts: {
      ru: {
        save: 'Принять'
      },
      en: {
        save: 'Accept'
      }
    }
  },
  telemetry: false,
})
