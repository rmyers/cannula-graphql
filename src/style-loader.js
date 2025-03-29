Share;

Copy;

/**
 * Loads Pico CSS and applies it to the document using Constructable Stylesheets
 * @returns {Promise<CSSStyleSheet|null>} The Pico CSS stylesheet or null if failed
 */
export async function loadPicoCSS() {
  try {
    // Check if Constructable Stylesheets are supported
    if (
      !("CSSStyleSheet" in window) ||
      !("replaceSync" in CSSStyleSheet.prototype)
    ) {
      console.warn(
        "Constructable Stylesheets not supported. Falling back to <link> element.",
      );
      return await loadPicoCSSFallback();
    }

    // Fetch Pico CSS from CDN
    const response = await fetch(
      "https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css",
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch Pico CSS: ${response.statusText}`);
    }

    const cssText = await response.text();

    // Create and populate a stylesheet
    const picoStyleSheet = new CSSStyleSheet();
    picoStyleSheet.replaceSync(cssText);

    // Apply to document
    document.adoptedStyleSheets = [
      ...document.adoptedStyleSheets,
      picoStyleSheet,
    ];

    return picoStyleSheet;
  } catch (error) {
    console.error("Error loading Pico CSS:", error);
    return await loadPicoCSSFallback();
  }
}

/**
 * Fallback method for browsers without Constructable Stylesheets support
 * @returns {Promise<null>} Always returns null
 */
async function loadPicoCSSFallback() {
  return new Promise((resolve) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css";

    link.onload = () => {
      console.log("Pico CSS loaded via <link> element");
      resolve(null);
    };

    link.onerror = () => {
      console.error("Failed to load Pico CSS via <link> element");
      resolve(null);
    };

    document.head.appendChild(link);
  });
}

/**
 * Creates a simple theme stylesheet with custom variables
 * @param {string} cssText - CSS text with custom variables
 * @returns {CSSStyleSheet|null} The theme stylesheet or null if not supported
 */
export function createTheme(cssText) {
  try {
    // Check if Constructable Stylesheets are supported
    if (
      !("CSSStyleSheet" in window) ||
      !("replaceSync" in CSSStyleSheet.prototype)
    ) {
      console.warn(
        "Constructable Stylesheets not supported. Falling back to <style> element.",
      );
      const style = document.createElement("style");
      style.textContent = cssText;
      document.head.appendChild(style);
      return null;
    }

    const themeSheet = new CSSStyleSheet();
    themeSheet.replaceSync(cssText);

    // Apply to document
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, themeSheet];

    return themeSheet;
  } catch (error) {
    console.error("Error creating theme:", error);
    return null;
  }
}
