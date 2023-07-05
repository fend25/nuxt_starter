<script setup lang="ts">
import {useLogin} from '~/composables/login'

const router = useRouter()
const {restoreStateAfterLogin} = useLogin()
onMounted(async () => {
  try {
    await restoreStateAfterLogin()
  } catch (e) {
    console.error(e)
    await router.replace('/')
  }
})

</script>

<template>
<h1>After Login</h1>
</template>

<style lang="scss" scoped>

</style>

<script lang="ts">
export default {
  name: "MyPage"
}
</script>
