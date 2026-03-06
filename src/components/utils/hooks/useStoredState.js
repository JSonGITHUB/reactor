import { useEffect, useState } from 'react';

const defaultSerializer = (value) => {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const defaultDeserializer = (value) => {
  if (value === null || value === undefined) return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const resolveInitial = (initialValue) =>
  typeof initialValue === 'function' ? initialValue() : initialValue;

// Persisted state backed by localStorage with optional custom (de)serializers.
const useStoredState = (
  key,
  initialValue,
  { serializer = defaultSerializer, deserializer = defaultDeserializer } = {}
) => {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null && stored !== undefined) {
        const parsed = deserializer(stored);
        return parsed === undefined ? resolveInitial(initialValue) : parsed;
      }
    } catch (err) {
      console.warn(`useStoredState: unable to read key "${key}":`, err);
    }
    return resolveInitial(initialValue);
  });

  useEffect(() => {
    try {
      const serialized = serializer(state);
      localStorage.setItem(key, serialized);
    } catch (err) {
      console.warn(`useStoredState: unable to write key "${key}":`, err);
    }
  }, [key, state, serializer]);

  return [state, setState];
};

export default useStoredState;
