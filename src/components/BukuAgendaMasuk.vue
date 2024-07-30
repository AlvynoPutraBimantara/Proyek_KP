<template>
  <div class="data-produk-container">
    <div class="header-container">
      <h1>BUKU AGENDA SURAT MASUK DI TATA USAHA</h1>
      <div class="dropdown-container">
        <select v-model="selectedMonth" class="month-dropdown" @change="applyFilters">
          <option disabled value="">Pilih Bulan</option>
          <option v-for="month in months" :key="month" :value="month">
            {{ month }}
          </option>
        </select>
        <select v-model="selectedYear" class="year-dropdown" @change="applyFilters">
          <option disabled value="">Pilih Tahun</option>
          <option v-for="year in years" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
        <button @click="exportToExcel" class="export-button">Export ke Excel</button>
      </div>
      <div class="search-container">
        <input type="text" v-model="searchQuery" placeholder="Cari Surat..." />
      </div>
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
                <div
                  v-if="sortMenu === 'disposisiSekretaris'"
                  class="sort-menu"
                >
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
                <font-awesome-icon
                  :icon="['fas', 'file-pdf']"
                  @click="viewPdf(item.pdfUrl)"
                />
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
import * as SheetJSStyle from "sheetjs-style";

export default {
  name: "BukuAgendaMasuk",
  data() {
    return {
      SuratMasuk: [],
      sortKey: "",
      sortMenu: "",
      searchQuery: "",
      selectedPdfUrl: null,
      showPdfViewer: true,
      selectedMonth: "",
      selectedYear: "",
      months: [
        "JANUARI",
        "FEBRUARI",
        "MARET",
        "APRIL",
        "MEI",
        "JUNI",
        "JULI",
        "AGUSTUS",
        "SEPTEMBER",
        "OKTOBER",
        "NOVEMBER",
        "DESEMBER",
      ],
      years: [
        2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035,
        2036, 2037, 2038, 2039, 2040, 2041, 2042, 2043, 2044,
      ],
    };
  },
  computed: {
    searchSurat() {
      return this.loadData.filter((loadData) =>
      loadData.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    filteredSuratMasuk() {
      let filtered = this.SuratMasuk;

      // Filter by selected month and year
      if (this.selectedMonth) {
        filtered = filtered.filter((item) => item.bulan === this.selectedMonth);
      }
      if (this.selectedYear) {
        filtered = filtered.filter((item) => item.tahun === this.selectedYear);
      }

      // Filter by search query
      if (this.searchQuery) {
        const searchQueryLower = this.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.suratDari.toLowerCase().includes(searchQueryLower) ||
            item.tanggalSurat.toLowerCase().includes(searchQueryLower) ||
            item.noSurat.toLowerCase().includes(searchQueryLower) ||
            item.perihal.toLowerCase().includes(searchQueryLower) ||
            item.diterimaTanggal.toLowerCase().includes(searchQueryLower) ||
            item.noAgenda.toLowerCase().includes(searchQueryLower) ||
            item.sifat.toLowerCase().includes(searchQueryLower) ||
            item.disposisiSekretaris.toLowerCase().includes(searchQueryLower) ||
            item.disposisiKasumpeg.toLowerCase().includes(searchQueryLower) ||
            item.tanggalDisposisi.toLowerCase().includes(searchQueryLower)
        );
      }

      // Sort filtered data
      if (this.sortKey) {
        filtered = filtered.slice().sort((a, b) => {
          const keys = this.sortKey.split('_');
          const key = keys[0];
          const order = keys[1];
          let modifier = 1;

          if (order === "desc") {
            modifier = -1;
          }

          if (a[key] < b[key]) {
            return -1 * modifier;
          }
          if (a[key] > b[key]) {
            return 1 * modifier;
          }
          return 0;
        });
      }

      return filtered;
    },
    sortedSuratMasuk() {
      let sortedArray = this.filteredSuratMasuk.slice();
      const sortFunction = (a, b, key) => {
        if (key.includes("asc")) {
          return a[key.split("_")[0]] > b[key.split("_")[0]] ? 1 : -1;
        }
        return a[key.split("_")[0]] < b[key.split("_")[0]] ? 1 : -1;
      };

      if (this.sortKey) {
        sortedArray.sort((a, b) => {
          switch (this.sortKey) {
            case "tanggalSurat_asc":
            case "tanggalSurat_desc":
            case "diterimaTanggal_asc":
            case "diterimaTanggal_desc":
            case "tanggalDisposisi_asc":
            case "tanggalDisposisi_desc":
              return sortFunction(new Date(a[this.sortKey.split("_")[0]]), new Date(b[this.sortKey.split("_")[0]]), this.sortKey);
            case "sifat_biasa":
            case "sifat_penting":
              if (this.sortKey === "sifat_biasa") {
                return a.sifat === "Biasa" ? -1 : 1;
              } else {
                return a.sifat === "Penting" ? -1 : 1;
              }
            default:
              return sortFunction(a, b, this.sortKey);
          }
        });
      }

      return sortedArray;
    },
  },

  methods: {
   loadData() {
    axios
        .get("http://localhost:3003/SuratMasuk")
        .then((response) => {
          this.SuratMasuk = response.data;
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    },
    exportToExcel() {
      const data = this.sortedSuratMasuk.map((item, index) => ({
        "No.": index + 1,
        "Surat Dari": item.suratDari,
        "Tgl. Surat": item.tanggalSurat,
        "No. Surat": item.noSurat,
        Perihal: item.perihal,
        "Diterima Tgl.": item.diterimaTanggal,
        "No. Agenda": item.noAgenda,
        Sifat: item.sifat,
        "Disposisi Sekretaris": item.disposisiSekretaris,
        "Disposisi Kasumpeg": item.disposisiKasumpeg,
        "Tgl Disposisi": item.tanggalDisposisi,
      }));

      const worksheet = {};

      const headers = [
        ["BUKU AGENDA SURAT MASUK DI TATA USAHA"],
        ["BULAN " + this.selectedMonth + " " + this.selectedYear],
        [],
        [
          "NO.",
          "   SURAT DARI   ",
          "TGL SURAT",
          "   NO. SURAT   ",
          "   PERIHAL   ",
          "DITERIMA TGL",
          "   NO. AGENDA   ",
          "SIFAT",
          "   DISPOSISI SEKRETARIS   ",
          "   DISPOSISI KASUMPEG   ",
          "TGL DISPOSISI",
        ],
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
      ];

      const commonAlignment = {
        horizontal: "center",
        vertical: "center",
        wrapText: true,
      };

      const styles = {
        header: {
          font: { bold: true, sz: 22 },
          alignment: { horizontal: "center", vertical: "middle" },
          wrapText: true,
        },
        subHeader: {
          fill: { fgColor: { rgb: "9DC3E6" } },
          font: { bold: true, sz: 12 },
          alignment: commonAlignment,
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
        },
        columnNumbers: {
          fill: { fgColor: { rgb: "FFFF00" } },
          font: { bold: true, sz: 12 },
          alignment: commonAlignment,
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
        },
        thickBorder: {
          border: {
            top: { style: "thick" },
            bottom: { style: "thick" },
            left: { style: "thick" },
            right: { style: "thick" },
          },
        },
        thinBorder: {
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
        },
      };

      // Add headers to the worksheet
      headers.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          const cellRef = SheetJSStyle.utils.encode_cell({
            r: rowIndex,
            c: colIndex + 1,
          });
          worksheet[cellRef] = {
            v: cell,
            s:
              rowIndex === 0 || rowIndex === 1
                ? styles.header
                : rowIndex === 3
                ? styles.subHeader
                : styles.columnNumbers,
          };
        });
      });

      // Merge cells for the title and the second row
      worksheet["!merges"] = [
        { s: { r: 0, c: 1 }, e: { r: 0, c: 11 } },
        { s: { r: 1, c: 1 }, e: { r: 1, c: 11 } },
      ];

      // Add data to the worksheet
      data.forEach((row, rowIndex) => {
        Object.values(row).forEach((cell, colIndex) => {
          const cellRef = SheetJSStyle.utils.encode_cell({
            r: rowIndex + headers.length,
            c: colIndex + 1,
          });
          worksheet[cellRef] = {
            v: cell,
            s: { ...styles.thinBorder, alignment: commonAlignment },
          };
        });
      });

      // Calculate column widths based on the widest text in each column
      const colWidths = headers[3].map((header, colIndex) => {
        const headerWidth = header.length;
        const maxDataWidth = Math.max(
          ...data.map(
            (row) => (row[headers[3][colIndex]] || "").toString().length
          )
        );
        return { wch: Math.max(headerWidth, maxDataWidth) + 5 };
      });

      // Define the range to cover the entire table with the added empty column
      const range = {
        s: { c: 1, r: 0 },
        e: { c: 11, r: data.length + headers.length - 1 },
      };
      worksheet["!ref"] = SheetJSStyle.utils.encode_range(range);

      // Set column widths dynamically based on content
      worksheet["!cols"] = [{ wch: 5 }].concat(colWidths);

      // Define the workbook and append the worksheet
      const workbook = SheetJSStyle.utils.book_new();
      SheetJSStyle.utils.book_append_sheet(
        workbook,
        worksheet,
        "BukuAgendaMasuk"
      );

      // Export the workbook to an Excel file
      SheetJSStyle.writeFile(
        workbook,
        `Buku Agenda Surat Masuk ${this.selectedMonth} ${this.selectedYear}.xlsx`
      );
    },
    applyFilters() {
      // This function will be triggered when the dropdowns change.
      // The filtering logic is already handled in the computed property 'filteredSuratMasuk'.
    },
    toggleSortMenu(column) {
      if (this.sortMenu === column) {
        this.sortMenu = "";
      } else {
        this.sortMenu = column;
      }
    },
    sortTable(key) {
      this.sortKey = key;
      this.sortMenu = "";
    },
    viewPdf(pdfUrl) {
      this.selectedPdfUrl = pdfUrl;
    },
    editItem(id) {
      this.$router.push({ name: "EditSuratMasuk", params: { id: id } });
    }
  },
  mounted() {
    this.loadData();
  },
};
</script>
<style scoped>

h1 {
  margin-bottom: 20px;
}

.dropdown-container {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.month-dropdown,
.year-dropdown {
  padding: 5px;
}

.export-button {
  padding: 5px 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.export-button:hover {
  background-color: lightgreen;
}

.main-container {
  display: flex;
}

.table-container {
  width: 100%;
  overflow-x: auto;
  margin: 5px;
  padding: 5px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  height: 75%;
}

.table-container table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid black;
}

.table-container th,
.table-container td {
  border: 1px solid #ddd;
  padding: 4px;
  text-align: left;
  word-wrap: break-word;
  white-space: pre-wrap;
  max-width: 10vw;
}

th {
  background-color: #f4f4f4;
}

.sort-menu {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
.sort-menu ul {
  list-style: none;
}
.sort-menu ul li {
  padding: 10px;
  cursor: pointer;
}
.sort-menu ul li:hover {
  background-color: #f2f2f2;
}

button {
  padding: 0.05vw 0.10vw;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.pdf-viewer {
  width: 66%;
  padding-right: 10px;
  margin-bottom: 20px;
}

.search-container {
  flex: 1;
  text-align: left;
}

.search-container input {
  padding: 10px;
  margin-bottom: 5px;
  font-size: 16px;
  width: 100%;
  max-width: 300px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>