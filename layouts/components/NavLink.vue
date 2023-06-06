<script setup lang="ts">
const {href} = defineProps<{ href: string }>()

const route = useRoute()
const active = computed(() => route.path.startsWith(href))
</script>

<template>
  <li class="nav-item" :class="{active}">
    <NuxtLink class="nav-link" :href="href">
      <slot/>
    </NuxtLink>
  </li>
</template>

<style lang="scss" scoped>

</style>

<script lang="ts">
export default {
  name: 'NavLink'
}
</script>
