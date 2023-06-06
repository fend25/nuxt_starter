import {defineStore} from 'pinia'
import {Ref} from 'vue'
import type {SafeUser} from '~/server/utils/prisma'

export const useMainStore = defineStore('me', () => {
  const user: Ref<SafeUser | null> = ref(null)

  return {
    user,
  }
})
