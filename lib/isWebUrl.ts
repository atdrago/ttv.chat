export const isWebUrl = (url: string): boolean => {
  if (!/^https?:\/\//.test(url)) {
    return false;
  }

  try {
    new URL(url);

    return true;
  } catch (err) {
    return false;
  }
};
