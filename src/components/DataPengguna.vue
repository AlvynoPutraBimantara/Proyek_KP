<template>
  <div class="data-pengguna-container">
    <h1>Data Pengguna</h1>
    <div class="table-container">
      <table border="1">
        <thead>
          <tr>
            <th>Id</th>
            <th>Nama</th>
            <th>Password</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in User" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.Nama }}</td>
            <td>{{ item.Password }}</td>
            <td>
              <button @click="confirmDelete(item.id)" class="btn-delete">
                Hapus
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "DataPengguna",
  data() {
    return {
      User: [],
    };
  },
  components: {},
  methods: {
    async HapusUser(id) {
      try {
        let result = await axios.delete(`http://localhost:3002/User/${id}`);
        if (result.status === 200) {
          this.loadData();
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user.");
      }
    },
    confirmDelete(id) {
      if (confirm("Apakah anda yakin akan menghapus?")) {
        this.HapusUser(id);
      }
    },
    async loadData() {
      try {
        let result = await axios.get("http://localhost:3002/User");
        this.User = result.data.filter((user) => user.role !== "admin");
      } catch (error) {
        console.error("Error loading data:", error);
        alert("Failed to load user data.");
      }
    },
  },
  async mounted() {
    this.loadData();
  },
};
</script>

<style scoped>
h1 {
  flex: 1;
  text-align: center;
}

.table-container {
  max-width: 100%;
  overflow-x: auto;
  margin: 20px;
  padding: 10px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  width: 100%;
}

.table-container table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;
}

.table-container th,
.table-container td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
  padding: 8px;
  position: relative;
  word-wrap: break-word;
  white-space: pre-wrap;
  max-width: 10vw;
}

th {
  background-color: #f4f4f4;
}

button {
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  justify-content: center;
  align-items: center;
}

button:hover {
  background-color: #0056b3;
}

@media (max-width: 768px) {
  .table-container {
    width: 100%;
  }
}
</style>
