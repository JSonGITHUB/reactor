import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const useUUID = () => {
  const [uuid, setUUID] = useState(uuidv4());

  const generateUUID = () => {
    setUUID(uuidv4());
  };

  return [uuid, generateUUID];
};

export default useUUID;
