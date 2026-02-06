const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const files = ["recipe_list.xlsx", "export_recipe_sales.xlsx"];
const baseDir = path.join(__dirname, "..");

for (const file of files) {
  const filePath = path.join(baseDir, file);
  if (!fs.existsSync(filePath)) continue;
  console.log(`\n=== ${file} ===`);
  const wb = XLSX.readFile(filePath);
  console.log("Sheets:", wb.SheetNames);
  wb.SheetNames.forEach((name) => {
    const ws = wb.Sheets[name];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    console.log(`\n--- Sheet: ${name} (${data.length} rows) ---`);
    console.log(JSON.stringify(data.slice(0, 6), null, 2));
  });
}
