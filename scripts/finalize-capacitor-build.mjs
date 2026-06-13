import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const generatedIndex = resolve("dist-capacitor/capacitor/index.html");
const capacitorIndex = resolve("dist-capacitor/index.html");

await mkdir(dirname(capacitorIndex), { recursive: true });
await copyFile(generatedIndex, capacitorIndex);
