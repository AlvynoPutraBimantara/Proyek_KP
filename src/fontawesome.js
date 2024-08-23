import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import {
  faSort,
  faFilePdf,
  faBars,
  faPrint,
  faCircleInfo,
  faCircleXmark
} from "@fortawesome/free-solid-svg-icons";


library.add(faSort,faFilePdf, faBars, faPrint,faWhatsapp,faCircleInfo, faCircleXmark);

export default FontAwesomeIcon;
