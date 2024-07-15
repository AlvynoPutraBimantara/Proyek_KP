<template>
    <div>
 
      <h1>EDIT BUKU AGENDA SURAT MASUK</h1>
      <div class="update-container">
        <form class="update" @submit.prevent="submitProduct">
          <div class="form-group">
            <label for="suratDari">Surat Dari</label>
            <input type="text" id="suratDari" v-model="DataProduk.suratDari" autocomplete="off" />
          </div>
  
          <div class="form-group">
            <label for="tanggalSurat">Tanggal Surat</label>
            <input type="date" id="tanggalSurat" v-model="DataProduk.tanggalSurat" />
          </div>
  
          <div class="form-group">
            <label for="noSurat">No. Surat</label>
            <input type="text" id="noSurat" v-model="DataProduk.noSurat" autocomplete="off" />
          </div>
  
          <div class="form-group">
            <label for="perihal">Perihal</label>
            <input type="text" id="perihal" v-model="DataProduk.perihal" autocomplete="off" />
          </div>
  
          <div class="form-group">
            <label for="diterimaTanggal">Diterima Tanggal</label>
            <input type="date" id="diterimaTanggal" v-model="DataProduk.diterimaTanggal" />
          </div>
  
          <div class="form-group">
            <label for="noAgenda">No. Agenda</label>
            <input type="text" id="noAgenda" v-model="DataProduk.noAgenda" autocomplete="off" />
          </div>
  
          <div class="form-group">
            <label for="sifat">Sifat</label>
            <select id="sifat" v-model="DataProduk.sifat">
              <option disabled value="">Pilih Sifat</option>
              <option value="Biasa">Biasa</option>
              <option value="Penting">Penting</option>
            </select>
          </div>
  
          <div class="form-group">
            <label for="disposisiSekretaris">Disposisi Sekretaris</label>
            <input type="text" id="disposisiSekretaris" v-model="DataProduk.disposisiSekretaris" autocomplete="off" />
          </div>
  
          <div class="form-group">
            <label for="disposisiKasumpeg">Disposisi Kasumpeg</label>
            <input type="text" id="disposisiKasumpeg" v-model="DataProduk.disposisiKasumpeg" autocomplete="off" />
          </div>
  
          <div class="form-group">
            <label for="tanggalDisposisi">Tanggal Disposisi</label>
            <input type="date" id="tanggalDisposisi" v-model="DataProduk.tanggalDisposisi" />
          </div>
  
          <button type="submit">SIMPAN</button>
          
        </form>
      </div>
    </div>
  </template>
  
  <script>
  
  import axios from "axios";
  
  export default {
    name: "EditSuratMasuk",
    components: {
     
    },
    data() {
      return {
        DataProduk: {
          suratDari: "",
          tanggalSurat: "",
          noSurat: "",
          perihal: "",
          diterimaTanggal: "",
          noAgenda: "",
          sifat: "",
          disposisiSekretaris: "",
          disposisiKasumpeg: "",
          tanggalDisposisi: "",
        },
      };
    },
    async created() {
      const id = this.$route.params.id;
      try {
        const result = await axios.get(`http://localhost:3000/SuratMasuk/${id}`);
        this.DataProduk = result.data;
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("An error occurred while fetching the data. Please try again later.");
      }
    },
    methods: {
      async submitProduct() {
        const id = this.$route.params.id;
        try {
          const formattedData = {
            ...this.DataProduk,
            tanggalSurat: this.revertDate(this.DataProduk.tanggalSurat),
            diterimaTanggal: this.revertDate(this.DataProduk.diterimaTanggal),
            tanggalDisposisi: this.revertDate(this.DataProduk.tanggalDisposisi),
          };
          const result = await axios.put(`http://localhost:3000/SuratMasuk/${id}`, formattedData);
          if (result.status === 200) {
            this.$router.push({ name: "BukuAgendaMasuk" });
          }
        } catch (error) {
          console.error("Error updating product:", error);
          alert("An error occurred while updating the product. Please try again later.");
        }
      },
      formatDate(dateString) {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      },
      revertDate(formattedDate) {
        if (!formattedDate) return "";
        const [day, month, year] = formattedDate.split("/");
        return `${year}-${month}-${day}`;
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
  
  .form-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .form-group label {
    width: 150px;
    margin-right: 10px;
  }
  
  .update input,
  .update select,
  .update button {
    display: block;
    padding: 10px;
    width: 400px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
  }
  
  .update button {
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    margin-top: 20px;
  }
  
  .update button:hover {
    background-color: #0056b3;
  }
  </style>
