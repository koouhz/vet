<template>
  <div id="app">
    <AppNavbar />

    <router-view />

    <AppFooter />
  </div>
</template>

<script>
import AppNavbar from './components/layouts/AppNavbar.vue'
import AppFooter from './components/layouts/AppFooter.vue'

export default {
  name: 'App',
  components: {
    AppNavbar,
    AppFooter
  }
}
</script>

<style>
* {
  word-wrap: break-word;
  hyphens: auto;
}
</style>
