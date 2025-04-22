import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';

// Kết nối tới local IPFS node hoặc một public gateway
const ipfs = create({ 
  host: 'localhost',
  port: 5001,
  protocol: 'http'
});

export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await ipfs.add(buffer);
    return result.path;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw error;
  }
};