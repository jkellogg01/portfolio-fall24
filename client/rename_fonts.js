#! /usr/bin/env node

import { readdir, rename } from "node:fs/promises";

const files = await readdir("public/ibm_plex");
const weightMap = {
  thin: 100,
  extralight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};
const replace = files.map((filename) => {
  let parts = filename
    .toLowerCase()
    .slice(0, filename.length - 4)
    .replace("ibmplex", "ibm_plex_")
    .replace("italic", "-i")
    .replace("--", "-regular-")
    .split("-");
  parts[1] = weightMap[parts[1]];
  return parts.join("-").concat(".ttf");
});
if (files.length != replace.length) {
  throw new Error();
}
replace.forEach(async (newName, index) => {
  try {
    await rename(
      "public/ibm_plex/" + files[index],
      "public/ibm_plex/" + newName,
    );
  } catch (err) {
    console.error(err);
  }
});
