// Utility functions to safely handle objects and prevent [object Object] errors

export const safeStringify = (obj, fallback = 'N/A') => {
  try {
    if (obj === null || obj === undefined) return fallback;
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'number') return obj.toString();
    if (typeof obj === 'boolean') return obj.toString();
    if (typeof obj === 'object') {
      return JSON.stringify(obj, null, 2);
    }
    return String(obj);
  } catch (error) {
    console.error('Error stringifying object:', error);
    return fallback;
  }
};

export const safeRender = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') {
    console.warn('Attempting to render object directly:', value);
    return fallback;
  }
  return value;
};

export const safeLog = (label, data) => {
  console.log(label, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
};

export const getNestedValue = (obj, path, fallback = '') => {
  try {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? fallback;
  } catch (error) {
    console.error('Error getting nested value:', error);
    return fallback;
  }
};
