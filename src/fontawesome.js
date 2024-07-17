import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faHome,
  faShoppingCart,
  faReceipt,
  faCircleInfo,
  faSort,
  faFilePdf
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons"; // Add this import

library.add(faHome, faShoppingCart, faWhatsapp, faReceipt, faCircleInfo, faSort,faFilePdf);

export default FontAwesomeIcon;
