//ProfilePopup.tsx
import React, { useRef, useEffect, useState } from 'react';
import Toast from './Toast';
import axios from 'axios';
import Gun from 'gun';

const PINATA_API_KEY = 'fc5a4ba2a55a4d610a1c';
const PINATA_SECRET_KEY = 'b28ce45eb0dec9b89ee0129dafe1eb24d970ce1fae8b16d5799ff405bbfa079a';

const pinFileToIPFS = async (file: File) => {
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

const gun = Gun();

type Props = {
  address: string;
  isOnline: boolean;
  onClose: () => void;
};

export default function ProfilePopup({ address, isOnline, onClose }: Props) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    gun.get('avatars').get(address).on((data) => {
      if (data && data.hash) {
        setAvatar(`https://ipfs.io/ipfs/${data.hash}`);
      }
    });
  }, [address]);

  const handleClickOutside = (event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToastMessage('File size cannot exceed 5MB');
      setShowToast(true);
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setToastMessage('Only image files are supported');
      setShowToast(true);
      return;
    }

    setIsUploading(true);
    try {
      const ipfsHash = await pinFileToIPFS(file);
      
      if (!ipfsHash) {
        throw new Error('Upload failed');
      }

      // Save to Gun
      gun.get('avatars').get(address).put({ hash: ipfsHash });

      // IPFS gateway URL
      const avatarUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      setAvatar(avatarUrl);
      
      setToastMessage('Avatar updated successfully');
      setShowToast(true);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setToastMessage('Could not upload image. Please try again');
      setShowToast(true);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div 
        ref={popupRef}
        className="bg-white rounded-lg p-6 w-96 relative shadow-xl"
        style={{
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        
        <div className="text-center">
          <div className="mb-4">
            <div className="w-24 h-24 mx-auto relative">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600"
                disabled={isUploading}
              >
                {isUploading ? '⏳' : '📷'}
              </button>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mb-2">{address}</h3>
          <p className="text-sm text-gray-500">
            Status: {isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
      </div>
      
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}





