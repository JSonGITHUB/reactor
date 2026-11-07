import { useState } from 'react';

const generateUuid = () => {
  const bytes = new Uint8Array(16);
  const cryptoApi = typeof window !== 'undefined' ? (window.crypto || null) : null;

  if (cryptoApi && typeof cryptoApi.getRandomValues === 'function') {
    cryptoApi.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const useUUID = () => {
  const [uuid, setUUID] = useState(generateUuid());

  const generateUUID = () => {
    setUUID(generateUuid());
  };

  return [uuid, generateUUID];
};

export default useUUID;
