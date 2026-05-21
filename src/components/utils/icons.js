// utils/icons.js
import { FaCamera, FaVideo } from 'react-icons/fa';

export const getIconForMediaType = (type) => {
    if (type === 'photo') return <FaCamera />;
    if (type === 'video') return <FaVideo />;
    return null;
};
