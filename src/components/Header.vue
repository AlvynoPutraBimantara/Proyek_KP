<template>
  <nav class="nav">
    <button class="btn btn-primary" @click="toggleMenu" id="menu-toggle">
      Menu
    </button>
    <router-link
      v-if="isAdmin || isUser"
      to="/BukuAgendaMasuk"
      :class="{ active: isActive('/BukuAgendaMasuk') }"
    >
      BUKU AGENDA SURAT MASUK
    </router-link>
    
    <router-link
      v-if="isAdmin || isUser"
      to="/BukuAgendaKeluar"
      :class="{ active: isActive('/BukuAgendaKeluar') }"
    >
      BUKU AGENDA SURAT KELUAR
    </router-link>
    
    <router-link
      v-if="isAdmin || isUser"
      to="/SuratMasuk"
      :class="{ active: isActive('/SuratMasuk') }"
    >
      INPUT SURAT MASUK
    </router-link>
   
    <router-link
      v-if="isAdmin || isUser"
      to="/SuratKeluar"
      :class="{ active: isActive('/SuratKeluar') }"
    >
      INPUT SURAT KELUAR
    </router-link>

    <a @click.prevent="logout" href="#">Logout</a>
  </nav>
</template>

<script>
export default {
  name: "Header",
  computed: {
    isAdmin() {
      const user = JSON.parse(localStorage.getItem("user-info"));
      return user && user.role === "admin";
    },
    isUser() {
      const user = JSON.parse(localStorage.getItem("user-info"));
      return user && user.role !== "admin";
    },
  },
  methods: {
    toggleMenu() {
      document.getElementById("wrapper").classList.toggle("toggled");
    },
    logout() {
      localStorage.clear();
      this.$router.push({ name: "LandingPage" }).then(() => {
        window.location.reload();
      });
    },
    isActive(route) {
      return this.$route.path === route;
    },
  },
};
</script>

<style scoped>
.nav {
  background-color: darkblue;
  display: flex;
  align-items: left;
  padding: 0 20px;
  width: 100%;
  gap: 8px;
  box-sizing: border-box; /* Ensure padding doesn't affect the width */
}

.nav a,
.nav button {
  color: aliceblue;
  padding: 20px;
  padding-left: 20px;
  text-align: center;
  font-size: 15px;
  border-radius: 5px;
  text-decoration: none;
}

.nav a:hover,
.nav button:hover,
.nav a.active {
  background: #ddd;
  color: #333;
}
</style>
