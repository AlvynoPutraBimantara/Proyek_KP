<template>
  <div>
    <h1>Tambah Pengguna</h1>
    <div class="update-container">
      <form class="update" @submit.prevent="TambahPengguna">
        <input
          type="text"
          name="Nama"
          placeholder="Masukan Nama"
          v-model="DataUser.Nama"
          autocomplete="off"
        />
        <input
          type="password"
          name="Password"
          placeholder="Masukan Password"
          v-model="DataUser.Password"
          autocomplete="off"
        />
        <button type="submit">Tambah Pengguna</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "TambahPengguna",
  data() {
    return {
      DataUser: {
        Nama: "",
        Password: "",
      },
    };
  },
  methods: {
    async TambahPengguna() {
  try {
    const result = await axios.post("http://localhost:3002/User", {
      Nama: this.DataUser.Nama,
      Password: this.DataUser.Password,
    });
    if (result.status === 201) {
      this.$router.push({ name: "DataPengguna" });
    }
  } catch (error) {
    console.error("Error adding user:", error);
    alert(
      "An error occurred while adding the user. Please try again later."
    );
  }
}

  },
  mounted() {
    let user = localStorage.getItem("user-info");
    if (!user) {
      this.$router.push({ name: "SignUp" });
    }
  },
};
</script>

<style scoped>
.update-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.update {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.update input,
.update button {
  display: block;
  margin-bottom: 10px;
  padding: 10px;
  width: 400px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.update input::placeholder {
  color: #aaa;
}

.update button {
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.update button:hover {
  background-color: #0056b3;
}
</style>
