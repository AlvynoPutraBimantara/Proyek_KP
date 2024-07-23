<template>
  <div class="data-produk-container">
    <div class="header-container">
      <h1>BUKU AGENDA SURAT MASUK DI TATA USAHA</h1>
      <div class="dropdown-container">
        <select v-model="selectedMonth" class="month-dropdown" @change="loadData">
      <option disabled value="">Pilih Bulan</option>
      <option v-for="month in months" :key="month" :value="month">
        {{ month }}
      </option>
    </select>
    <select v-model="selectedYear" class="year-dropdown" @change="loadData">
      <option disabled value="">Pilih Tahun</option>
      <option v-for="year in years" :key="year" :value="year">
        {{ year }}
      </option>
    </select>
        <button @click="exportToExcel" class="export-button">
          Export ke Excel
        </button>
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
      selectedPdfUrl: null,
      showPdfViewer: true,
      selectedMonth: "",
      selectedYear: "",
      months: [
        "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
        "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
      ],
      years: [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040, 2041, 2042, 2043, 2044]
    };
  },
  computed: {
    sortedSuratMasuk() {
      return [...this.SuratMasuk].sort((a, b) => {
        let [key, order] = this.sortKey.split("_");
        if (
          key === "tanggalSurat" ||
          key === "diterimaTanggal" ||
          key === "tanggalDisposisi"
        ) {
          return order === "asc"
            ? new Date(a[key]) - new Date(b[key])
            : new Date(b[key]) - new Date(a[key]);
        }
        if (order === "asc") {
          return a[key] > b[key] ? 1 : -1;
        } else {
          return a[key] < b[key] ? -1 : 1;
        }
      });
    },
  },
  methods: {
    
    loadData() {
      const params = {};
      if (this.selectedMonth) params.bulan = this.selectedMonth;
      if (this.selectedYear) params.tahun = this.selectedYear;

      axios.get("http://localhost:3000/SuratMasuk", { params })
        .then(response => {
          this.SuratMasuk = response.data;
        })
        .catch(error => {
          console.error(error);
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
      ["BULAN " + this.selectedMonth +" "+ this.selectedYear], 
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
    SheetJSStyle.writeFile(workbook, `Buku Agenda Surat Masuk ${this.selectedMonth} ${this.selectedYear}.xlsx`);
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
  }
};
</script>
<style scoped>
.data-produk-container {
  padding: 20px;
}

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
  padding: 8px;
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
}

.sort-menu li:hover {
  background: #ddd;
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

.pdf-viewer {
  width: 66%;
  padding-right: 10px;
  margin-bottom: 20px;
}
</style>
