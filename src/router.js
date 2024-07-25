import { createRouter, createWebHistory } from "vue-router";
import SignUp from "./components/SignUp.vue";
import Login from "./components/Login.vue";
import BukuAgendaMasuk from "./components/BukuAgendaMasuk.vue";
import SuratMasuk from "./components/SuratMasuk.vue";
import LandingPage from "./components/LandingPage.vue";
import EditSuratMasuk from "./components/EditSuratMasuk.vue";
import TambahPengguna from "./components/TambahPengguna.vue";
import DataPengguna from "./components/DataPengguna.vue";
import SuratKeluar from "./components/SuratKeluar.vue";
import BukuAgendaKeluar from "./components/BukuAgendaKeluar.vue";
import EditSuratKeluar from "./components/EditSuratKeluar.vue";

const routes = [
  {
    path: "/",
    name: "LandingPage",
    component: LandingPage,
  },
  {
    name: "SignUp",
    component: SignUp,
    path: "/sign-up",
  },
  {
    name: "Login",
    component: Login,
    path: "/login",
  },
  {
    name: "BukuAgendaMasuk",
    component: BukuAgendaMasuk,
    path: "/BukuAgendaMasuk",
  },
  {
    name: "SuratMasuk",
    component: SuratMasuk,
    path: "/SuratMasuk",
  },
  {
    name: "EditSuratMasuk",
    component: EditSuratMasuk,
    path: "/EditSuratMasuk/:id",
  },
  {
    name: "TambahPengguna",
    component: TambahPengguna,
    path: "/TambahPengguna",
  },
  {
    name: "DataPengguna",
    component: DataPengguna,
    path: "/DataPengguna",
  },
  {
    name: "BukuAgendaKeluar",
    component: BukuAgendaKeluar,
    path: "/BukuAgendaKeluar",
  },
  {
    name: "SuratKeluar",
    component: SuratKeluar,
    path: "/SuratKeluar",
  },
  {
    name: "EditSuratKeluar",
    component: EditSuratKeluar,
    path: "/EditSuratKeluar/:id",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem("user-info"));
  const isGuest = localStorage.getItem("guest") === "true";

  if (to.matched.some((record) => record.meta.requiresAdmin)) {
    if (user && user.role === "admin") {
      next();
    } else {
      next({ name: "Dashboard" });
    }
  } else if (
    to.name !== "LandingPage" &&
    to.name !== "Login" &&
    to.name !== "SignUp" &&
    !user &&
    !isGuest
  ) {
    next({ name: "LandingPage" });
  } else {
    next();
  }
});

export default router;
