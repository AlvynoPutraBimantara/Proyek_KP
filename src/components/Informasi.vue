<template>
  <div>
    <div class="warung-details">
      <h1>Petunjuk penggunaan aplikasi</h1>
      <div class="card">
        <img src="@/assets/images/4.jpg" alt="Image 4" />
        <p>Pilih terlebih dahulu bulan dan tahun dari buku agenda untuk menampilkan buku agenda yang diinginkan </p>
      </div>
      <div class="card">
        <img src="@/assets/images/1.jpg" alt="Image 1" />
        <ol>
          <li>Menu untuk mencari data berdasarkan kata kunci</li>
          <li>Tombol untuk menghapus filter pilihan bulan dan tahun buku agenda</li>
          <li>Menu untuk memilih bulan dari buku agenda untuk ditampilkan</li>
          <li>Menu untuk memilih tahun dari buku agenda untuk ditampilkan</li>
          <li>Tombol untuk mengekspor atau mengunduh tabel buku agenda yang ditampilkan menjadi file spreadsheet</li>
          <li>Tombol untuk mencetak tabel buku agenda yang ditampilkan kepada printer</li>
          <li>
            Menu untuk mengurutkan data tabel berdasarkan tanggal surat, menu tersebut memberikan pilihan untuk
            mengurutkan berdasarkan terlama atau terbaru menurut data yang disimpan
          </li>
          <li>
            Menu untuk mengurutkan data tabel berdasarkan nomor, menu tersebut memberikan pilihan untuk mengurutkan
            berdasarkan nomor terkecil atau terbesar menurut data yang disimpan
          </li>
          <li>
            Menu untuk mengurutkan data tabel berdasarkan huruf, menu tersebut memberikan pilihan untuk mengurutkan
            berdasarkan huruf kata pertama terawal(A) atau terakhir (Z) menurut data yang disimpan
          </li>
          <li>Tombol untuk menampilkan file lampiran sesuai dengan data yang ditampilkan pada baris tabel data tersebut</li>
          <li>Tombol untuk Log-out</li>
          <li>Tombol untuk mengubah "edit" data yang ditampilkan pada baris tabel data tersebut</li>
          <li>Tombol untuk menghapus baris tabel data yang dipilih beserta data dan lampiranya.</li>
        </ol>
      </div>
      <div class="card">
        <img src="@/assets/images/2.jpg" alt="Image 2" />
        <ol>
          <li>Kolom untuk memasukkan data asal surat</li>
          <li>Menu untuk memberi keterangan tanggal surat</li>
          <li>Kolom untuk memasukkan data nomor surat</li>
          <li>Kolom untuk memasukkan data perihal surat</li>
          <li>Menu untuk memberi keterangan tanggal diterima</li>
          <li>Kolom untuk memasukkan data nomor agenda surat</li>
          <li>Menu untuk memberi keterangan sifat kepentingan surat</li>
          <li>Kolom untuk memasukkan data disposisi Sekretaris</li>
          <li>Kolom untuk memasukkan data disposisi Kasumpeg</li>
          <li>Menu untuk memberi keterangan tanggal disposisi</li>
          <li>Menu untuk memberi keterangan bulan dari buku agenda</li>
          <li>Menu untuk memberi keterangan tahun dari buku agenda</li>
          <li>Tombol menu untuk menampilkan dan memasukan file lampiran</li>
          <li>Tombol untuk menyimpan data kedalam buku agenda</li>
        </ol>
      </div>
      <div class="card">
        <img src="@/assets/images/3.jpg" alt="Image 3" />
        <ol><li>Untuk mencetak spreadsheet maka klik tombol yang ditandai dengan kotak merah pada pojok kanan atas</li>
          <li>Idealnya Spreadsheet dicetak dengan kertas berukuran "A4" </li>
        </ol>
      </div>

      <div class="card" >
        <p>Bila mendapat error atau masalah berkeseterusan saat menggunakan aplikasi anda dapat menguhubungi admin</p>
      <div class="button-container">
        <button @click="goToWhatsApp" class="whatsapp-button">
          <font-awesome-icon icon="fa-brands fa-whatsapp" />
           Kontak Admin
        </button>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    goToWhatsApp() {
      const whatsappUrl = `https://wa.me/6287857909820`;
      window.open(whatsappUrl, "_blank");
    },
  },
};
</script>

<style scoped>
.warung-details {
  padding: 20px;
  text-align: center;
}

.button-container {
  display: flex;
  justify-content: center;
}

.whatsapp-button {
  display: inline-flex;
  align-items: center;
  background-color: #25d366;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-bottom: 20px;
}

.whatsapp-button font-awesome-icon {
  margin-left: 10px;
  font-size: 24px;
}

.whatsapp-button:hover {
  background-color: #1ebe57;
}

.card {
  width: 50vw;
  margin: 20px auto;
  border: 1px solid #ccc;
  padding: 10px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
}

.card img {
  width: 100%;
  height: auto;
  display: block;
  margin-bottom: 10px;
}

.card ol {
  text-align: left;
  padding-left: 20px;
  margin: 0;
}

.card p {
  text-align: left;
  margin-top: 10px;
}
</style>
