<template>
  <div>
    <h1>EDIT BUKU AGENDA SURAT MASUK</h1>
    <div class="main-container">
      <div v-if="pdfUrl" class="pdf-viewer">
        <iframe :src="pdfUrl" width="100%" height="1080px"></iframe>
      </div>
      <div class="update-container">
        <form class="update" @submit.prevent="submitProduct">
          <div class="form-group">
            <label for="suratDari">Surat Dari</label>
            <input type="text" id="suratDari" v-model="SuratMasuk.suratDari" autocomplete="off" />
          </div>
          <div class="form-group">
            <label for="tanggalSurat">Tanggal Surat</label>
            <input type="date" id="tanggalSurat" v-model="SuratMasuk.tanggalSurat" />
          </div>
          <div class="form-group">
            <label for="noSurat">No. Surat</label>
            <input type="text" id="noSurat" v-model="SuratMasuk.noSurat" autocomplete="off" />
          </div>
          <div class="form-group">
            <label for="perihal">Perihal</label>
            <input type="text" id="perihal" v-model="SuratMasuk.perihal" autocomplete="off" />
          </div>
          <div class="form-group">
            <label for="diterimaTanggal">Diterima Tanggal</label>
            <input type="date" id="diterimaTanggal" v-model="SuratMasuk.diterimaTanggal" />
          </div>
          <div class="form-group">
            <label for="noAgenda">No. Agenda</label>
            <input type="text" id="noAgenda" v-model="SuratMasuk.noAgenda" autocomplete="off" />
          </div>
          <div class="form-group">
            <label for="sifat">Sifat</label>
            <select id="sifat" v-model="SuratMasuk.sifat">
              <option disabled value="">Pilih Sifat</option>
              <option value="Biasa">Biasa</option>
              <option value="Penting">Penting</option>
            </select>
          </div>
          <div class="form-group">
            <label for="disposisiSekretaris">Disposisi Sekretaris</label>
            <input type="text" id="disposisiSekretaris" v-model="SuratMasuk.disposisiSekretaris" autocomplete="off" />
          </div>
          <div class="form-group">
            <label for="disposisiKasumpeg">Disposisi Kasumpeg</label>
            <input type="text" id="disposisiKasumpeg" v-model="SuratMasuk.disposisiKasumpeg" autocomplete="off" />
          </div>
          <div class="form-group">
            <label for="tanggalDisposisi">Tanggal Disposisi</label>
            <input type="date" id="tanggalDisposisi" v-model="SuratMasuk.tanggalDisposisi" />
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
          <button type="button" @click="triggerFileUpload">LAMPIRAN</button>
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
  name: "EditSuratMasuk",
  data() {
    return {
      SuratMasuk: {
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
      selectedMonth: "",
      selectedYear: "",
      months: [
        "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
        "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
      ],
      years: [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040, 2041, 2042, 2043, 2044]
    };
  },
  async created() {
    const id = this.$route.params.id;
    try {
      const result = await axios.get(`http://localhost:3003/SuratMasuk/${id}`);
      const data = result.data;
      this.SuratMasuk = {
        ...data,
        tanggalSurat: this.formatDateToInput(data.tanggalSurat),
        diterimaTanggal: this.formatDateToInput(data.diterimaTanggal),
        tanggalDisposisi: this.formatDateToInput(data.tanggalDisposisi),
      };
      this.selectedMonth = data.bulan;
      this.selectedYear = data.tahun;
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
          ...this.SuratMasuk,
          tanggalSurat: this.formatDate(this.SuratMasuk.tanggalSurat),
          diterimaTanggal: this.formatDate(this.SuratMasuk.diterimaTanggal),
          tanggalDisposisi: this.formatDate(this.SuratMasuk.tanggalDisposisi),
          bulan: this.selectedMonth,
          tahun: this.selectedYear
        };

        if (this.pdfFile) {
          const formData = new FormData();
          formData.append("pdf", this.pdfFile);

          const response = await axios.post("http://localhost:3005/uploads", formData);
          formattedData.pdfUrl = `http://localhost:3005/uploads/${response.data.fileId}`; // Store the URL directly
        }

        const result = await axios.put(`http://localhost:3003/SuratMasuk/${id}`, formattedData);
        if (result.status === 200) {
          this.$router.push({ name: "BukuAgendaMasuk" });
        }
      } catch (error) {
        console.error("Error updating data:", error);
        alert("Error saat update data");
      }
    },
    formatDate(dateString) {
      if (!dateString) return "";
      const [year, month, day] = dateString.split("-");
      return `${day}/${month}/${year}`;
    },
    formatDateToInput(dateString) {
      if (!dateString) return "";
      const [day, month, year] = dateString.split("/");
      return `${year}-${month}-${day}`;
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
          this.pdfUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  }
};
</script>

<style scoped>
.main-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  padding: 10px;
}

.pdf-viewer {
  flex: 2;
}

.update-container {
  flex: 1;
  max-width: 600px;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.pdf-viewer iframe {
  width: 100%;
  height: 1080px;
  border: none;
}

.form-group {
  margin-bottom: 15px;
}

label {
  font-weight: bold;
}

input, select, button {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  background-color: #4CAF50;
  color: white;
  cursor: pointer;
  border: none;
  margin-top: 20px;
}

button:hover {
  background-color: #45a049;
}
</style>
