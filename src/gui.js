import { configuration, embedMode } from "./main";

// main
let resizeBarX;
let resizeBarY;
let resizeBarBott;


// embed


if (!configuration.embed) {
  // embed mode OFF
  embedMode = false;
} else {
  // embed mode ON
  embedMode = true;
}
