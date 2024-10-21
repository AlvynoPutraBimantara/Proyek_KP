// main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "../../store";
import FontAwesomeIcon from "./fontawesome";

const app = createApp(App);

app.component("font-awesome-icon", FontAwesomeIcon);
app.use(router);
app.use(store); // Attach the store to the Vue instance
app.mount("#app");