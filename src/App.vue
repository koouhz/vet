<template>
  <div id="app">
    <!-- Navbar fija en todas las vistas -->
    <AppNavbar />

    <!-- Aquí se renderiza el contenido dinámico de cada ruta -->
    <router-view />

    <!-- Footer fijo en todas las vistas -->
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
