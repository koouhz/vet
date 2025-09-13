<!-- src/components/Navbar.vue -->
<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-logo">
        <img src="@/assets/logo.png" alt="Logo Veterinaria" />
        <h1>Veterinaria Vet</h1>
      </div>
      <ul class="nav-links">
        <li><router-link to="/">Inicio</router-link></li>
        <li><router-link to="/servicios">Servicios</router-link></li>
        <li><router-link to="/equipo">Nuestro Equipo</router-link></li>
        <li><router-link to="/contacto">Contacto</router-link></li>
      </ul>
      <div class="nav-phone">
        <span>📞 (555) 123-4567</span>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'AppNavbar'
}
</script>

<style scoped>
.navbar {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  font-family: 'Inter', sans-serif;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.nav-logo {
  display: flex;
  align-items: center;
}

.nav-logo img {
  height: 50px;
  margin-right: 1rem;
  border-radius: 8px;
}

.nav-logo h1 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links li {
  margin-left: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: #2c3e50;
  font-weight: 500;
  transition: color 0.3s;
  position: relative;
}

.nav-links a:hover {
  color: #3498db;
}

.nav-links a.router-link-active {
  color: #3498db;
}

.nav-links a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #3498db;
  border-radius: 2px;
}

.nav-phone {
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    text-align: center;
    padding: 0 1rem;
  }

  .nav-logo {
    margin-bottom: 1rem;
  }

  .nav-links {
    margin: 1rem 0;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .nav-links li {
    margin: 0.5rem 0;
    width: 100%;
  }

  .nav-links a {
    display: block;
    padding: 0.5rem;
    width: 100%;
  }

  .nav-phone {
    margin-top: 1rem;
  }
}
</style>
