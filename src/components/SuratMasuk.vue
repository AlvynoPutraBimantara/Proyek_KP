<template>
  <div>
    <h1>INPUT SURAT MASUK</h1>
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
  name: "SuratMasuk",
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
  methods: {
    async submitProduct() {
      try {
        const formattedData = {
          ...this.SuratMasuk,
          tanggalSurat: this.formatDate(this.SuratMasuk.tanggalSurat),
          diterimaTanggal: this.formatDate(this.SuratMasuk.diterimaTanggal),
          tanggalDisposisi: this.formatDate(this.SuratMasuk.tanggalDisposisi),
          bulan: this.selectedMonth, 
          tahun: this.selectedYear 
        };

        Object.keys(formattedData).forEach(key => {
          if (formattedData[key] === "") {
            delete formattedData[key];
          }
        });

        if (this.pdfFile) {
          const formData = new FormData();
          formData.append("pdf", this.pdfFile);
          const response = await axios.post(
            "http://localhost:3005/uploads",
            formData
          );
          formattedData.pdfUrl = `http://localhost:3005${response.data.pdfUrl}`;
        }

        const result = await axios.post("http://localhost:3003/SuratMasuk", formattedData);
        if (result.status === 201) {
          this.$router.push({ name: "BukuAgendaMasuk" });
        }
      } catch (error) {
        console.error("Error adding product:", error);
        alert("An error occurred while adding the product. Please try again later.");
      }
    },
    formatDate(dateString) {
      if (!dateString) return "";
      const [year, month, day] = dateString.split("-");
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
.main-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  padding: 20px;
}

.update-container {
  max-width: 800px;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.update {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
}

.form-group {
  display: flex;
  flex-direction: row;
  font-size: 18px;
  text-align: left;
  font-weight: bold;
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
  margin-top: 10px;
}

.update button:hover {
  background-color: #0056b3;
}

.pdf-viewer {
  flex: 0 1 60%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
