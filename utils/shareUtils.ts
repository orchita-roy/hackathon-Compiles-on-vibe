export const getShareableUrl = (): string => {
  // In some sandboxed environments, window.location.href might not be a shareable URL like "about:blank".
  // The Web Share API requires a valid URL, typically starting with http:// or https://.
  if (window.location.href && window.location.href.startsWith('http')) {
    return window.location.href;
  }
  // Provide a fallback canonical URL for the app to ensure the share API works correctly.
  return 'https://healthfriend.app'; 
};
