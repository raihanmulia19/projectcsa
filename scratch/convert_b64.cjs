const fs = require('fs');
const image = fs.readFileSync('d:/WEB/projectcsa/public/images/kop_surat.png');
const base64 = image.toString('base64');
const content = `export const kopSuratBase64 = "data:image/png;base64,${base64}";\n`;
fs.mkdirSync('d:/WEB/projectcsa/resources/js/utils', { recursive: true });
fs.writeFileSync('d:/WEB/projectcsa/resources/js/utils/kopSuratBase64.js', content);
console.log('Success');
