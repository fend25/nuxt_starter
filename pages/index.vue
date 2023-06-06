<script setup lang="ts">
import {useMainStore} from '~/stores/main.store'

const {user} = useMainStore()
</script>

<template>
  <!--  <br/><button class="btn btn-primary me-3">{{ $t('common.welcome') }}</button>-->

  <div>
    <template v-if="user">
      <div>
        <span class="capitalize-first-letter">{{ $t('common.me') }}:</span>

        <div class="card" style="width: 18rem;">
          <img :src="user.avatarUrl" class="card-img-top" :alt="$t('aria.userAvatar')">
          <div class="card-body">
            <h5 class="card-title">{{ user.fullName }}</h5>
            <p class="card-text">{{ user.email }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.user-card {
  max-width: 18rem;
  padding: 2rem;
}

.user-avatar {
  width: 100px;
  border-radius: 50%;
  object-fit: fill;
}

.capitalize-first-letter {
  text-transform: capitalize;
}
</style>
