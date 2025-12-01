import { useMemo } from 'react';

export const formatDate = (isoString, locale = 'en-US') => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};