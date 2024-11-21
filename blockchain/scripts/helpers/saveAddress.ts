import fs from 'fs';

export function saveAddress(jsonData: any) {
  fs.writeFile(
    "./scripts/addresses.json", JSON.stringify(jsonData), function (err) {
      if (err) {
        console.log(err);
      }
    });
}

export function appendAddress(jsonData: any) {
  fs.appendFile(
    "./scripts/vaultAddresses.json", JSON.stringify(jsonData), function (err) {
      if (err) {
        console.log(err);
      }
  });
}

export function loadAddresses() {
  return JSON.parse(fs.readFileSync("./scripts/vaultAddresses.json", "utf8"))
}