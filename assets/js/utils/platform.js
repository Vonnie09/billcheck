/* Which device and browser the app is running on */

const ua = navigator.userAgent;

export const isAndroid = /android/i.test(ua);
// iPads report themselves as a Mac with touch, so check for that too (never on Android)
export const isIOS = !isAndroid && (/iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
export const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios|edg|android/i.test(ua);
export const isFirefox = /firefox|fxios/i.test(ua);
export const isTouch = navigator.maxTouchPoints > 0;

/** True when opened from the home screen (installed app), not a browser tab. */
export const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
