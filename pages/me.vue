<script setup lang="ts">
const route = useRoute()
onMounted(async () => {
  console.log(route.params)
})
</script>

<template>
<h1>My page</h1>
</template>

<style lang="scss" scoped>

</style>

<script lang="ts">
export default {
  name: "MyPage"
}
</script>
