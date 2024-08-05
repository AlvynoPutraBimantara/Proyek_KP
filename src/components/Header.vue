<template>
  <nav class="nav">
    <button class="btn btn-primary" @click="toggleMenu" id="menu-toggle">
      <font-awesome-icon :icon="['fas', 'bars']" />
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
    <router-link
      v-if="isAdmin || isUser"
      to="/PreviewBukuAgendaMasuk"
      :class="{ active: isActive('/PreviewBukuAgendaMasuk') }"
    >
      CETAK BUKU AGENDA SURAT MASUK
    </router-link>

    <a @click.prevent="logout" class="logout-btn" href="#">Logout</a>
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
  padding: 1vh 10px;
  width: 100%;
  gap: 1vh;
  box-sizing: border-box;
}

.nav a,
.nav button {
  color: aliceblue;
  padding: 10px;
  padding-left: 10px;
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

.logout-btn {
  background-color: red;
  color: white;
  padding: 10px 20px;
  text-align: center;
  font-size: 15px;
  border-radius: 5px;
  text-decoration: none;
  margin-left: auto;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.logout-btn:hover {
  background-color: darkred;
  color: white;
}
</style>
