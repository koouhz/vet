<template>
  <div>
    <AppNavbar />
    <router-view />
    <AppFooter />
  </div>
</template>

<script>
import AppNavbar from '@/components/layouts/AppNavbar.vue'
import AppFooter from '@/components/layouts/AppFooter.vue'

export default {
  components: { AppNavbar, AppFooter }
}
</script>
