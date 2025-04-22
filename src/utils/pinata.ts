import axios from 'axios';

const PINATA_API_KEY = 'fc5a4ba2a55a4d610a1c';
const PINATA_SECRET_KEY = 'b28ce45eb0dec9b89ee0129dafe1eb24d970ce1fae8b16d5799ff405bbfa079a';

export const pinFileToIPFS = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  
  try {
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
      }
    });
    
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
};