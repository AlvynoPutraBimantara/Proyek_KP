<template>
  <!-- Container for the entire preview section -->
  <div class="preview-buku-agenda-masuk-container">

    <!-- Header section displaying the title -->
    <div class="header">
      <h1>Preview Cetak Buku Agenda Surat Masuk</h1> <!-- Displays a heading for the PDF preview -->
    </div>

    <!-- Show loading indicator if 'loading' is true -->
    <div v-if="loading" class="loading-indicator">
      Loading... <!-- Shows "Loading..." while the PDF is being fetched or processed -->
    </div>

    <!-- Show the iframe with the PDF file if 'pdfUrl' is set and 'loading' is false -->
    <iframe v-if="pdfUrl && !loading" :src="pdfUrl" width="100%" height="1080px"></iframe>
    <!-- Displays the PDF file inside an iframe if the file is loaded successfully -->
  </div>
</template>

<script>
import axios from "axios"; // Import axios to make HTTP requests to the backend

export default {
  name: "PreviewBukuAgendaMasuk", // The name of the component

  // Define component's reactive data
  data() {
    return {
      fileUrl: "", // Holds the file URL retrieved from the route query parameters
      pdfUrl: "",  // Holds the final PDF URL to display in the iframe
      loading: true, // Flag to show/hide loading indicator while the PDF is being processed
    };
  },

  // Lifecycle hook: executed when the component is created
  async created() {
    this.loadFile(); // Call loadFile method to retrieve the file URL from route query
    await this.viewFileAsPDF(); // Call viewFileAsPDF method to convert and fetch the PDF
  },

  // Lifecycle hook: executed before the component is destroyed
  beforeUnmount() {
    this.cleanupFiles(); // Call cleanupFiles method to remove temporary files when leaving the page
  },

  methods: {
    // Method to load file URL from the query parameter of the current route
    loadFile() {
  const fileUrl = this.$route.query.fileUrl;  // Get the file URL from the route query
  if (fileUrl) {
    this.fileUrl = fileUrl;  // Save the URL for use in `viewFileAsPDF`
  }
}
,

  // Method to send a request to the server to fetch the PDF blob from the database
  async viewFileAsPDF() {
  const fileName = this.fileUrl.split("/").pop();

  try {
    // Fetch the PDF blob from the backend
    const response = await axios.get(
      `http://localhost:3006/print-service/pdf/${fileName}`, 
      { responseType: "blob" }  // Ensure the response is a binary blob
    );

    // Create a blob URL for the PDF file
    const pdfBlob = new Blob([response.data], { type: "application/pdf" });
    this.pdfUrl = URL.createObjectURL(pdfBlob);

    this.loading = false;
  } catch (error) {
    console.error("Error fetching PDF from server:", error);
    this.loading = false;
  }
}
,

    // Method to clean up files on the server when the user navigates away
    async cleanupFiles() {
      try {
        // Send a request to clean up the server-side temporary files (PDF, Excel)
        await axios.post("http://localhost:3006/print-service/cleanup");
      } catch (error) {
        console.error("Error cleaning up files:", error); // Log error if cleanup fails
      }
    },
  },
};
</script>

<style scoped>
/* Style for the main container */
.preview-buku-agenda-masuk-container {
  display: flex; /* Use flexbox to center the content */
  flex-direction: column; /* Arrange content in a vertical stack */
  align-items: center; /* Horizontally center the content */
  justify-content: center; /* Vertically center the content */
  min-height: 100vh; /* Ensure the container takes up the full height of the viewport */
}

/* Style for the header section */
.header {
  margin-bottom: 20px; /* Add space below the header */
}

/* Style for the loading indicator */
.loading-indicator {
  font-size: 1.5em; /* Larger font size for the loading text */
  color: #555; /* Dark gray color for the loading text */
}
</style>