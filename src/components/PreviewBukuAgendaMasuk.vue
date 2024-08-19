<template>
  <div class="preview-buku-agenda-masuk-container">
    <div class="header">
      <h1>Preview Cetak Buku Agenda Surat Masuk</h1>
    </div>

    <div v-if="loading" class="loading-indicator">
      Loading...
    </div>

    <iframe v-if="pdfUrl && !loading" :src="pdfUrl" width="100%" height="1080px"></iframe>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "PreviewBukuAgendaMasuk",
  data() {
    return {
      fileUrl: "",
      pdfUrl: "",
      loading: true,
    };
  },
  async created() {
    await this.deleteDbJsonData();
    this.loadFile();
    await this.viewFileAsPDF();
  },
  beforeUnmount() {
    this.cleanupFiles();
  },
  methods: {
    async deleteDbJsonData() {
      try {
        await axios.post("http://localhost:3006/cleanup-dbjson");
      } catch (error) {
        console.error("Error deleting data from db.json:", error);
      }
    },
    loadFile() {
      const fileUrl = this.$route.query.fileUrl;
      if (fileUrl) {
        this.fileUrl = `http://localhost:3006${fileUrl}`;
      }
    },
    async viewFileAsPDF() {
      const fileName = this.fileUrl.split("/").pop();
      try {
        const response = await axios.post(
          `http://localhost:3006/print-service/ConvertToPDF/${encodeURIComponent(fileName)}`
        );
        this.pdfUrl = `http://localhost:3006${response.data.pdfUrl}`;
      } catch (error) {
        console.error("Error converting file to PDF:", error);
      } finally {
        this.loading = false;
      }
    },
    async cleanupFiles() {
      try {
        await axios.post("http://localhost:3006/print-service/cleanup");
      } catch (error) {
        console.error("Error cleaning up files:", error);
      }
    },
  },
};
</script>


<style scoped>
.preview-buku-agenda-masuk-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
.header {
  margin-bottom: 20px;
}
.loading-indicator {
  font-size: 1.5em;
  color: #555;
}
</style>
