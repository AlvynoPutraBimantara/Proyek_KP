<template>
  <div class="preview-buku-agenda-masuk-container">
    <div class="header">
      <h1>Preview Buku Agenda Surat Masuk</h1>
    </div>
    <table>
      <thead>
        <tr>
          <th>File Name</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ fileUrl.split("/").pop() }}</td>
          <td>
            <button @click="viewFileAsPDF" class="print-button">
              <font-awesome-icon :icon="['fas', 'file-pdf']" /> View as PDF
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <iframe v-if="pdfUrl" :src="pdfUrl" width="100%" height="800px"></iframe>
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
    };
  },
  created() {
    this.loadFile();
  },
  methods: {
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
        alert("Failed to convert the file to PDF.");
      }
    },
  },
};
</script>

<style scoped>
.preview-buku-agenda-masuk-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.print-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
}

.print-button:hover {
  background-color: #45a049;
}
</style>
