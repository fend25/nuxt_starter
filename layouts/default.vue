<script lang="tsx" setup>
import {useMainStore} from '~/stores/main.store'
import NavLink from './components/NavLink'

const {user} = useMainStore()
</script>

<template>
  <header class="mb-2">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container">
        <NuxtLink class="navbar-brand" href="/">
          <img src="/img/logo.svg" width="100" :alt="$t('aria.logo')">
          <span>Nuxt starter</span>
        </NuxtLink>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <NavLink href="/me">{{ $t('navigation.myPage') }}</NavLink>
          </ul>
          <ul class="navbar-nav ms-auto">
            <template v-if="user">
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown" role="button"
                   data-bs-toggle="dropdown" aria-expanded="false">
                  <span class="me-2">{{ user.fullName }}</span>
                  <img v-if="user.avatarUrl" :src="user.avatarUrl" alt="User Avatar" class="user-avatar">
                </a>
                <ul class="dropdown-menu" aria-labelledby="userDropdown">
                  <li><a class="dropdown-item" href="/settings">{{ $t('common.settings') }}</a></li>
                  <li>
                    <hr class="dropdown-divider">
                  </li>
                  <li><a class="dropdown-item" href="/api/auth/logout">{{ $t('common.logout') }}</a></li>
                </ul>
              </li>
            </template>
            <template v-else>
              <li class="nav-item">
                <a class="nav-link" href="/api/auth/login/google">{{ $t('common.login') }}</a>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>
  </header>
  <div class="container safe-area-container">
    <slot/>
  </div>
</template>


<style lang="scss" scoped>
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.safe-area-container {
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}
</style>
