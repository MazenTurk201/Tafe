import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// عدل المسار ده حسب مكان Backend عندك
const distPath = path.resolve(__dirname, "../dist");
const backendPath = path.resolve(
  __dirname,
  "../../Backend/Tafe/wwwroot"
);

function copyFolder(source, destination) {
  fs.cpSync(source, destination, {
    recursive: true,
    force: true
  });
}

if (!fs.existsSync(distPath)) {
  console.error("❌ dist folder not found.");
  process.exit(1);
}

if (!fs.existsSync(backendPath)) {
  fs.mkdirSync(backendPath, { recursive: true });
}

// امسح wwwroot القديم
for (const file of fs.readdirSync(backendPath)) {
  fs.rmSync(path.join(backendPath, file), {
    recursive: true,
    force: true
  });
}

// انسخ React build
copyFolder(distPath, backendPath);

console.log("✅ React build copied to Backend/wwwroot");
