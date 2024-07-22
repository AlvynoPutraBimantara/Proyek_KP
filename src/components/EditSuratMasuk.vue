<template>
  <div>
    <h1>EDIT BUKU AGENDA SURAT MASUK</h1>
    <div class="main-container">
      <div v-if="pdfUrl" class="pdf-viewer">
        <iframe :src="pdfUrl" width="100%" height="1080px"></iframe>
      </div>
      <div class="update-container">
        <form class="update" @submit.prevent="submitProduct">
          <!-- Form fields -->
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
          <div class="form-group">
            <label for="bulan">Bulan</label>
            <select id="bulan" v-model="selectedMonth">
              <option disabled value="">Pilih Bulan</option>
              <option v-for="month in months" :key="month" :value="month">
                {{ month }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="tahun">Tahun</label>
            <select id="tahun" v-model="selectedYear">
              <option disabled value="">Pilih Tahun</option>
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
          <button type="button" @click="triggerFileUpload">Import</button>
          <button type="submit">SIMPAN</button>
          <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none;" />
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "SuratMasuk",
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
        tanggalDisposisi: ""
      },
      pdfFile: null,
      pdfUrl: null,
      selectedMonth: "", // Add selectedMonth data property
      selectedYear: "", // Add selectedYear data property
      months: [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ], // Add months array
      years: Array.from({ length: 20 }, (_, i) => 2024 + i) // Add years array dynamically
    };
  },
  async created() {
    const id = this.$route.params.id;
    try {
      const result = await axios.get(`http://localhost:3000/SuratMasuk/${id}`);
      const data = result.data;
      this.DataProduk = {
        ...data,
        tanggalSurat: this.formatDateToInput(data.tanggalSurat),
        diterimaTanggal: this.formatDateToInput(data.diterimaTanggal),
        tanggalDisposisi: this.formatDateToInput(data.tanggalDisposisi),
      };
      this.selectedMonth = data.bulan; // Set selectedMonth based on fetched data
      this.selectedYear = data.tahun; // Set selectedYear based on fetched data
      this.pdfUrl = data.pdfUrl;
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
          tanggalSurat: this.formatDateToBackend(this.DataProduk.tanggalSurat),
          diterimaTanggal: this.formatDateToBackend(this.DataProduk.diterimaTanggal),
          tanggalDisposisi: this.formatDateToBackend(this.DataProduk.tanggalDisposisi),
          bulan: this.selectedMonth, // Include selected month in submission
          tahun: this.selectedYear // Include selected year in submission
        };

        if (this.pdfFile) {
          const formData = new FormData();
          formData.append("pdf", this.pdfFile);
          const response = await axios.post("http://localhost:3001/uploads", formData);
          formattedData.pdfUrl = `http://localhost:3001${response.data.pdfUrl}`;
        }

        const result = await axios.put(`http://localhost:3000/SuratMasuk/${id}`, formattedData);
        if (result.status === 200) {
          this.$router.push({ name: "BukuAgendaMasuk" });
        }
      } catch (error) {
        console.error("Error updating product:", error);
        alert("An error occurred while updating the product. Please try again later.");
      }
    },
    formatDateToInput(date) {
      if (!date) return "";
      const [day, month, year] = date.split("/");
      return `${year}-${month}-${day}`;
    },
    formatDateToBackend(date) {
      if (!date) return "";
      const [year, month, day] = date.split("-");
      return `${day}/${month}/${year}`;
    },
    triggerFileUpload() {
      this.$refs.fileInput.click();
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file && file.type === "application/pdf") {
        this.pdfFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          const blob = new Blob([e.target.result], { type: 'application/pdf' });
          this.pdfUrl = URL.createObjectURL(blob);
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert("Please select a valid PDF file.");
      }
    }
  }
};
</script>

<style scoped>
.update-container {
  flex: 1;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.main-container {
  display: flex;
  align-items: flex-start;
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
.update select {
  display: block;
  padding: 10px;
  width: 800px;
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
  align-items: center;
  border-radius: 4px;
  width: 200px;
  padding: 10px;
}

.update button:hover {
  background-color: #0056b3;
}

.pdf-viewer {
  flex: 1;
  margin-right: 20px;
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }

  .pdf-viewer {
    width: 100%;
    margin-bottom: 20px;
  }
}
</style>
