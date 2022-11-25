/**
 * This module was inspired by the wonderful "a11ycolor" module, but was
 * refactored with the following goals:
 * - Remove the "color" library, which was ranking high in memory usage
 * - Be less generic regarding color inputs (less processing)
 * - Add TypeScript
 * - Be more functional
 */

type RgbTuple = [number, number, number];
type HslTuple = [number, number, number];

function hexToRgb(hexColor: string): RgbTuple {
  const red = parseInt(hexColor.slice(1, 3), 16);
  const green = parseInt(hexColor.slice(3, 5), 16);
  const blue = parseInt(hexColor.slice(5, 7), 16);

  return [red, green, blue];
}

function rgbToHex(rgbColor: RgbTuple): string {
  const integer =
    ((Math.round(rgbColor[0]) & 0xff) << 16) +
    ((Math.round(rgbColor[1]) & 0xff) << 8) +
    (Math.round(rgbColor[2]) & 0xff);

  const string = integer.toString(16).toUpperCase();

  return `#${"000000".substring(string.length) + string}`;
}

function rgbToHsl(rgbColor: RgbTuple): HslTuple {
  const r = rgbColor[0] / 255;
  const g = rgbColor[1] / 255;
  const b = rgbColor[2] / 255;
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const delta = max - min;
  let h = 0;
  let s;

  if (max === min) {
    h = 0;
  } else if (r === max) {
    h = (g - b) / delta;
  } else if (g === max) {
    h = 2 + (b - r) / delta;
  } else if (b === max) {
    h = 4 + (r - g) / delta;
  }

  h = Math.min(h * 60, 360);

  if (h < 0) {
    h += 360;
  }

  const l = (min + max) / 2;

  if (max === min) {
    s = 0;
  } else if (l <= 0.5) {
    s = delta / (max + min);
  } else {
    s = delta / (2 - max - min);
  }

  return [h, s * 100, l * 100];
}

function hslToRgb(hslColor: HslTuple): RgbTuple {
  const h = hslColor[0] / 360;
  const s = hslColor[1] / 100;
  const l = hslColor[2] / 100;
  let t2;
  let t3;
  let val;

  if (s === 0) {
    val = l * 255;

    return [val, val, val];
  }

  if (l < 0.5) {
    t2 = l * (1 + s);
  } else {
    t2 = l + s - l * s;
  }

  const t1 = 2 * l - t2;

  const rgb: RgbTuple = [0, 0, 0];

  for (let i = 0; i < 3; i++) {
    t3 = h + (1 / 3) * -(i - 1);

    if (t3 < 0) {
      t3++;
    }

    if (t3 > 1) {
      t3--;
    }

    if (6 * t3 < 1) {
      val = t1 + (t2 - t1) * 6 * t3;
    } else if (2 * t3 < 1) {
      val = t2;
    } else if (3 * t3 < 2) {
      val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
    } else {
      val = t1;
    }

    rgb[i] = val * 255;
  }

  return rgb;
}

function luminosity(rgbColor: RgbTuple): number {
  const lum = [];

  for (let i = 0; i < rgbColor.length; i++) {
    const chan = rgbColor[i] / 255;
    lum[i] =
      chan <= 0.03928 ? chan / 12.92 : Math.pow((chan + 0.055) / 1.055, 2.4);
  }

  return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
}

function contrast(rgbColor1: RgbTuple, rgbColor2: RgbTuple): number {
  // http://www.w3.org/TR/WCAG20/#contrast-ratiodef
  const lum1 = luminosity(rgbColor1);
  const lum2 = luminosity(rgbColor2);

  if (lum1 > lum2) {
    return (lum1 + 0.05) / (lum2 + 0.05);
  }

  return (lum2 + 0.05) / (lum1 + 0.05);
}

const RATIO = 4.5;
const MIN_HEX_DIFF = 100 / 255; // 255 Colors / 100% HSL

/**
 * Calculate an accessible color based on a foreground (text) color and
 * background color. Colors should be hex with leading '#'
 */
export const accessibleColor = (
  foregroundColor: string,
  backgroundColor: string
): string => {
  const foregroundRgb = hexToRgb(foregroundColor);
  const backgroundRgb = hexToRgb(backgroundColor);

  if (contrast(foregroundRgb, backgroundRgb) >= RATIO) {
    return foregroundColor;
  }

  const [foregroundHue, foregroundSaturation, foregroundLightness] =
    rgbToHsl(foregroundRgb);

  const isBlackBackgroundContrast = contrast(backgroundRgb, [0, 0, 0]) >= RATIO;
  const isWhiteBackgroundContrast =
    contrast(backgroundRgb, [255, 255, 255]) >= RATIO;

  let minLightness = 0;
  let maxLightness = 100;
  let isDarkColor = false;

  // If black and white both pass on the background
  if (isBlackBackgroundContrast && isWhiteBackgroundContrast) {
    // Change the min lightness if the color is light
    if (foregroundLightness >= 50) {
      minLightness = foregroundLightness;
    } else {
      // Change the max lightness if the color is dark
      maxLightness = foregroundLightness;
      isDarkColor = true;
    }
  } else if (isBlackBackgroundContrast) {
    // If our color passes contrast on black
    maxLightness = foregroundLightness;
    isDarkColor = true;
  } else {
    // Color doesn't meet contrast pass on black
    minLightness = foregroundLightness;
  }

  // The color to return
  let foundColor;

  // Binary search until we find the color that meets contrast
  while (!foundColor) {
    const midLightness = (minLightness + maxLightness) / 2;
    const midForeground = hslToRgb([
      foregroundHue,
      foregroundSaturation,
      midLightness,
    ]);

    if (contrast(midForeground, backgroundRgb) >= RATIO) {
      // It is the minimal lightness range for one hexadecimal
      if (maxLightness - minLightness <= MIN_HEX_DIFF) {
        foundColor = rgbToHex(midForeground);
      } else if (isDarkColor) {
        // If it is going to be a dark color move the min to mid
        minLightness = midLightness;
      } else {
        // If it is going to be a light color move the max to mid
        maxLightness = midLightness;
      }
    } else if (isDarkColor) {
      // We do not meet minimum contrast if it is a dark color move max to mid
      maxLightness = midLightness;
    } else {
      // If it is a light color move min to mid
      minLightness = midLightness;
    }
  }

  return foundColor;
};
