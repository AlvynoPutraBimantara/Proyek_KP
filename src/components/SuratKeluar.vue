<template>
    <div>
      <h1>INPUT SURAT KELUAR</h1>
      <div class="main-container">
        <div v-if="pdfUrl" class="pdf-viewer">
          <iframe :src="pdfUrl" width="100%" height="1080px"></iframe>
        </div>
        <div class="update-container">
          <form class="update" @submit.prevent="submitProduct">
            <div class="form-group">
              <label for="suratDari">Surat Dari</label>
              <input type="text" id="suratDari" v-model="SuratKeluar.suratDari" autocomplete="off" />
            </div>
  
            <div class="form-group">
              <label for="tanggalSurat">Tanggal Surat</label>
              <input type="date" id="tanggalSurat" v-model="SuratKeluar.tanggalSurat" />
            </div>
  
            <div class="form-group">
              <label for="noSurat">No. Surat</label>
              <input type="text" id="noSurat" v-model="SuratKeluar.noSurat" autocomplete="off" />
            </div>
  
            <div class="form-group">
              <label for="perihal">Perihal</label>
              <input type="text" id="perihal" v-model="SuratKeluar.perihal" autocomplete="off" />
            </div>
  
            <div class="form-group">
              <label for="diterimaTanggal">Diterima Tanggal</label>
              <input type="date" id="diterimaTanggal" v-model="SuratKeluar.diterimaTanggal" />
            </div>
  
            <div class="form-group">
              <label for="noAgenda">No. Agenda</label>
              <input type="text" id="noAgenda" v-model="SuratKeluar.noAgenda" autocomplete="off" />
            </div>
  
            <div class="form-group">
              <label for="sifat">Sifat</label>
              <select id="sifat" v-model="SuratKeluar.sifat">
                <option disabled value="">Pilih Sifat</option>
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
              </select>
            </div>
  
            <div class="form-group">
              <label for="disposisiSekretaris">Disposisi Sekretaris</label>
              <input type="text" id="disposisiSekretaris" v-model="SuratKeluar.disposisiSekretaris" autocomplete="off" />
            </div>
  
            <div class="form-group">
              <label for="disposisiKasumpeg">Disposisi Kasumpeg</label>
              <input type="text" id="disposisiKasumpeg" v-model="SuratKeluar.disposisiKasumpeg" autocomplete="off" />
            </div>
  
            <div class="form-group">
              <label for="tanggalDisposisi">Tanggal Disposisi</label>
              <input type="date" id="tanggalDisposisi" v-model="SuratKeluar.tanggalDisposisi" />
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
            <button type="submit">Masukan</button>
            <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none;" />
            
          </form>
        </div>
      </div>
    </div>
  </template>
  
  
  <script>
  import axios from "axios";
  
  export default {
    name: "SuratKeluar",
    data() {
      return {
        SuratKeluar: {
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
        "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
        "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
      ], // Add months array
        years: [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040, 2041, 2042, 2043, 2044]
      };
    },
    methods: {
      async submitProduct() {
        if (this.validateForm()) {
          try {
            const formattedData = {
              ...this.SuratKeluar,
              tanggalSurat: this.formatDate(this.SuratKeluar.tanggalSurat),
              diterimaTanggal: this.formatDate(this.SuratKeluar.diterimaTanggal),
              tanggalDisposisi: this.formatDate(this.SuratKeluar.tanggalDisposisi),
              bulan: this.selectedMonth, // Include selected month
              tahun: this.selectedYear // Include selected year
            };
  
            if (this.pdfFile) {
              const formData = new FormData();
              formData.append("pdf", this.pdfFile);
              const response = await axios.post(
                "http://localhost:3005/uploads",
                formData
              );
              formattedData.pdfUrl = `http://localhost:3005${response.data.pdfUrl}`;
            }
  
            const result = await axios.post("http://localhost:3004/SuratKeluar", formattedData);
            if (result.status === 201) {
              this.$router.push({ name: "BukuAgendaKeluar" });
            }
          } catch (error) {
            console.error("Error adding product:", error);
            alert("An error occurred while adding the product. Please try again later.");
          }
        } else {
          alert("Please fill out all required fields.");
        }
      },
      validateForm() {
        return Object.values(this.SuratKeluar).every(value => value !== "") &&
               this.selectedMonth !== "" &&
               this.selectedYear !== "";
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
  
  .pdf-viewer {
    flex: 0 1 50%;
    max-width: 100%;
  }
  </style>
  
  