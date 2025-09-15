<template>
  <li class="nav-item">
    <router-link
      v-if="to"
      :to="to"
      class="nav-link"
      active-class="active"
      @click="handleClick"
    >
      <i :class="icon" class="nav-icon"></i>
      <span class="nav-label">{{ label }}</span>
    </router-link>
    <a
      v-else
      href="#"
      class="nav-link"
      @click.prevent="handleClick"
    >
      <i :class="icon" class="nav-icon"></i>
      <span class="nav-label">{{ label }}</span>
    </a>
  </li>
</template>

<script setup>
defineProps({
  to: {
    type: [String, Object],
    default: null
  },
  icon: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['click']);

const handleClick = () => {
  emit('click');
};
</script>

<style scoped>
.nav-item {
  margin: 0.125rem 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #475569;
  font-weight: 500;
  border-radius: 8px;
  margin: 0 0.5rem;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.nav-link.active {
  background-color: #dbeafe;
  color: #1d4ed8;
  font-weight: 600;
}

.nav-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.nav-label {
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

.sidebar-collapsed .nav-label {
  opacity: 0;
  width: 0;
  overflow: hidden;
}
</style>
