<template>
  <div>
    <Sidebar /> <!-- Sidebar del dashboard -->
    <router-view />
  </div>
</template>

<script>
import Sidebar from '@/components/layouts/AppSidebar.vue'

export default {
  components: { Sidebar }
}
</script>
