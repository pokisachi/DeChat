import CryptoJS from 'crypto-js';

// Tạo key từ private key của ví và roomId
export const deriveSecretKey = (privateKey: string, roomId: string): string => {
  return CryptoJS.PBKDF2(privateKey, roomId, {
    keySize: 256/32,
    iterations: 1000
  }).toString();
};

// Mã hóa với IV (Initialization Vector) để tăng tính ngẫu nhiên
export const encryptMessage = async (text: string, key: string): Promise<string> => {
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(text, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  // Kết hợp IV với ciphertext
  return iv.toString() + encrypted.toString();
};

export const decryptMessage = async (ciphertext: string, key: string): Promise<string> => {
  try {
    // Tách IV và ciphertext
    const iv = ciphertext.slice(0, 32);
    const actualCiphertext = ciphertext.slice(32);
    
    const decrypted = CryptoJS.AES.decrypt(actualCiphertext, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch {
    return "[Không thể giải mã]";
  }
}
