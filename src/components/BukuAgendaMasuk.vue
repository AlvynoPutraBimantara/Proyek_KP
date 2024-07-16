<template>
  <div class="data-produk-container">
    <div class="header-container">
      <h1>BUKU AGENDA SURAT MASUK DI TATA USAHA</h1>
      <button @click="exportToExcel" class="export-button">Export ke Excel</button>
    </div>
    <div class="main-container">
      <div v-if="selectedPdfUrl" class="pdf-viewer">
        <iframe :src="selectedPdfUrl" width="100%" height="1080px"></iframe>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Preview PDF</th>
              <th>
                Surat Dari
                <span @click="toggleSortMenu('suratDari')">
                  <font-awesome-icon :icon="['fas', 'sort']" />
                </span>
                <div v-if="sortMenu === 'suratDari'" class="sort-menu">
                  <ul>
                    <li @click="sortTable('suratDari_asc')">A-Z</li>
                    <li @click="sortTable('suratDari_desc')">Z-A</li>
                  </ul>
                </div>
              </th>
              <th>
                Tgl. Surat
                <span @click="toggleSortMenu('tanggalSurat')">
                  <font-awesome-icon :icon="['fas', 'sort']" />
                </span>
                <div v-if="sortMenu === 'tanggalSurat'" class="sort-menu">
                  <ul>
                    <li @click="sortTable('tanggalSurat_asc')">Terlama</li>
                    <li @click="sortTable('tanggalSurat_desc')">Terbaru</li>
                  </ul>
                </div>
              </th>
              <th>
                No. Surat
                <span @click="toggleSortMenu('noSurat')">
                  <font-awesome-icon :icon="['fas', 'sort']" />
                </span>
                <div v-if="sortMenu === 'noSurat'" class="sort-menu">
                  <ul>
                    <li @click="sortTable('noSurat_asc')">1-10</li>
                    <li @click="sortTable('noSurat_desc')">10-1</li>
                  </ul>
                </div>
              </th>
              <th>
                Perihal
                <span @click="toggleSortMenu('perihal')">
                  <font-awesome-icon :icon="['fas', 'sort']" />
                </span>
                <div v-if="sortMenu === 'perihal'" class="sort-menu">
                  <ul>
                    <li @click="sortTable('perihal_asc')">A-Z</li>
                    <li @click="sortTable('perihal_desc')">Z-A</li>
                  </ul>
                </div>
              </th>
              <th>
                Diterima Tgl.
                <span @click="toggleSortMenu('diterimaTanggal')">
                  <font-awesome-icon :icon="['fas', 'sort']" />
                </span>
                <div v-if="sortMenu === 'diterimaTanggal'" class="sort-menu">
                  <ul>
                    <li @click="sortTable('diterimaTanggal_asc')">Terlama</li>
                    <li @click="sortTable('diterimaTanggal_desc')">Terbaru</li>
                  </ul>
                </div>
              </th>
              <th>
                No. Agenda
                <span @click="toggleSortMenu('noAgenda')">
                  <font-awesome-icon :icon="['fas', 'sort']" />
                </span>
                <div v-if="sortMenu === 'noAgenda'" class="sort-menu">
                  <ul>
                    <li @click="sortTable('noAgenda_asc')">1-10</li>
                    <li @click="sortTable('noAgenda_desc')">10-1</li>
                  </ul>
                </div>
              </th>
              <th>
                Sifat
                <span @click="toggleSortMenu('sifat')">
                  <font-awesome-icon :icon="['fas', 'sort']" />
                </span>
                <div v-if="sortMenu === 'sifat'" class="sort-menu">
                  <ul>
                    <li @click="sortTable('sifat_biasa')">Biasa</li>
                    <li @click="sortTable('sifat_penting')">Penting</li>
                  </ul>
                </div>
              </th>
              <th>
                Disposisi Sekretaris
                <span @click="toggleSortMenu('disposisiSekretaris')">
                  <font-awesome-icon :icon="['fas', 'sort']" />
                </span>
                <div v-if="sortMenu === 'disposisiSekretaris'" class="sort-menu">
                  <ul>
                    <li @click="sortTable('disposisiSekretaris_asc')">A-Z</li>
                    <li @click="sortTable('disposisiSekretaris_desc')">Z-A</li>
                  </ul>
                </div>
              </th>
              <th>
                Disposisi Kasumpeg
                <span @click="toggleSortMenu('disposisiKasumpeg')">
                  <font-awesome-icon :icon="['fas', 'sort']" />
                </span>
                <div v-if="sortMenu === 'disposisiKasumpeg'" class="sort-menu">
                  <ul>
                    <li @click="sortTable('disposisiKasumpeg_asc')">A-Z</li>
                    <li @click="sortTable('disposisiKasumpeg_desc')">Z-A</li>
                  </ul>
                </div>
              </th>
              <th>
                Tgl Disposisi
                <span @click="toggleSortMenu('tanggalDisposisi')">
                  <font-awesome-icon :icon="['fas', 'sort']" />
                </span>
                <div v-if="sortMenu === 'tanggalDisposisi'" class="sort-menu">
                  <ul>
                    <li @click="sortTable('tanggalDisposisi_asc')">Terlama</li>
                    <li @click="sortTable('tanggalDisposisi_desc')">Terbaru</li>
                  </ul>
                </div>
              </th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in sortedSuratMasuk" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>
                <img :src="item.pdfThumbnail" @click="viewPdf(item.pdfUrl)" class="pdf-thumbnail" />
              </td>
              <td>{{ item.suratDari }}</td>
              <td>{{ item.tanggalSurat }}</td>
              <td>{{ item.noSurat }}</td>
              <td>{{ item.perihal }}</td>
              <td>{{ item.diterimaTanggal }}</td>
              <td>{{ item.noAgenda }}</td>
              <td>{{ item.sifat }}</td>
              <td>{{ item.disposisiSekretaris }}</td>
              <td>{{ item.disposisiKasumpeg }}</td>
              <td>{{ item.tanggalDisposisi }}</td>
              <td>
                <button @click="editItem(item.id)">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import * as XLSX from "xlsx";

export default {
  name: "BukuAgendaMasuk",
  data() {
    return {
      SuratMasuk: [],
      sortKey: '',
      sortMenu: '',
      selectedPdfUrl: null
    };
  },
  computed: {
    sortedSuratMasuk() {
      return [...this.SuratMasuk].sort((a, b) => {
        let [key, order] = this.sortKey.split('_');
        if (key === 'tanggalSurat' || key === 'diterimaTanggal' || key === 'tanggalDisposisi') {
          return order === 'asc'
            ? new Date(a[key]) - new Date(b[key])
            : new Date(b[key]) - new Date(a[key]);
        }
        if (order === 'asc') {
          return a[key] > b[key] ? 1 : -1;
        } else {
          return a[key] < b[key] ? 1 : -1;
        }
      });
    }
  },
  methods: {
    async loadData() {
      try {
        let result = await axios.get("http://localhost:3000/SuratMasuk");
        this.SuratMasuk = result.data.map(surat => ({
          ...surat,
          pdfThumbnail: `/uploads/${surat.pdfThumbnail}`,
          pdfUrl: surat.pdfUrl // Keep the original URL
        }));
      } catch (error) {
        console.error("Error loading data:", error);
      }
    },
    toggleSortMenu(column) {
      this.sortMenu = this.sortMenu === column ? '' : column;
    },
    sortTable(key) {
      this.sortKey = key;
      this.sortMenu = '';
    },
    viewPdf(url) {
      // Set the full URL for the PDF viewer
      this.selectedPdfUrl = url;
    },
    exportToExcel() {
      const ws = XLSX.utils.json_to_sheet(this.SuratMasuk);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Surat Masuk");
      XLSX.writeFile(wb, "SuratMasuk.xlsx");
    },
    editItem(id) {
      this.$router.push({ name: 'EditSuratMasuk', params: { id } });
    }
  },
  mounted() {
    this.loadData();
  }
};
</script>

<style scoped>
.data-produk-container {
  padding: 20px;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

h1 {
  flex: 1;
  text-align: center;
}

.export-button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  border-radius: 5px;
  font-size: 16px;
}

.export-button:hover {
  background-color: #0056b3;
}

.main-container {
  display: flex;
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
}

th {
  background-color: #f4f4f4;
}

.sort-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
  list-style-type: none;
  margin: 0;
  padding: 5px;
}

.sort-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sort-menu li {
  padding: 5px 10px;
  cursor: pointer;
  padding: 5px;
}

.sort-menu li:hover {
  background: #f4f4f4;
  background-color: #ddd;
}

button {
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.pdf-thumbnail {
  width: 50px;
  height: auto;
  cursor: pointer;
}

.pdf-viewer {
  width: 50%;
  padding-right: 20px;
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }
  
  .pdf-viewer {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .table-container {
    width: 100%;
  }
}
</style>
