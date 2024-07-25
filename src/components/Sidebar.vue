<template>
  <div class="bg-light border-right" id="sidebar-wrapper">
    <div class="sidebar-heading">Buku Agenda DLH</div>
    <div class="list-group list-group-flush">
      <router-link
        to="/BukuAgendaMasuk"
        class="list-group-item list-group-item-action bg-light"
        >BUKU AGENDA SURAT MASUK</router-link
      >
      <router-link
        to="/SuratMasuk"
        class="list-group-item list-group-item-action bg-light"
        >INPUT SURAT MASUK</router-link
      >
      <router-link
        to="/BukuAgendaKeluar"
        class="list-group-item list-group-item-action bg-light"
        >BUKU AGENDA SURAT KELUAR</router-link
      >
      <router-link
        to="/SuratMasuk"
        class="list-group-item list-group-item-action bg-light"
        >INPUT SURAT KELUAR</router-link
      >
      <router-link
        to="/TambahPengguna"
        class="list-group-item list-group-item-action bg-light"
        >TAMBAH PENGGUNA</router-link
      >
      <router-link
        to="/DataPengguna"
        class="list-group-item list-group-item-action bg-light"
        >DATA PENGGUNA</router-link
      >
      <a
        v-on:click="logout"
        href="#"
        class="list-group-item list-group-item-action bg-light"
        >Logout</a
      >
    </div>
  </div>
</template>

<script>
export default {
  name: "Sidebar",
  methods: {
    logout() {
      this.$emit("logout");
    },
  },
};
</script>

<style scoped>
.list-group-item-action {
  transition: background-color 0.3s ease, color 0.3s ease;
}

.list-group-item-action:hover {
  background-color: darkblue;
  color: white;
}
</style>
