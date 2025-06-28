

const CryptoJS = require('crypto-js');
const SECRET_KEY = 'your-very-strong-secret-key';


function encryptData(data) {
  const jsonData = JSON.stringify(data);
  const ciphertext = CryptoJS.AES.encrypt(jsonData, SECRET_KEY).toString();
  return ciphertext;
}

function decryptData(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decryptedData;
}
function generateSHA256Hash(input) {
  return CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
}

module.exports = {
  encryptData,
  decryptData,
  generateSHA256Hash
}