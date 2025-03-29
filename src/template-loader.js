/**
 * Template processing utilities for web components
 */

/**
 * Creates a document fragment from HTML string
 *
 * @param {string} html - HTML string to convert to DocumentFragment
 * @returns {DocumentFragment} Document fragment containing the parsed HTML
 */
export function htmlToFragment(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.cloneNode(true);
}

/**
 * Loads component template from an HTML file
 * This works with rollup-plugin-html which converts HTML imports to strings
 *
 * @param {string} htmlString - Imported HTML string
 * @param {ShadowRoot} shadowRoot - The shadow root to append the template to
 * @returns {DocumentFragment} Document fragment of the parsed template
 */
export function loadTemplate(htmlString, shadowRoot) {
  const fragment = htmlToFragment(htmlString);
  shadowRoot.appendChild(fragment);
  return fragment;
}

/**
 * Combines HTML template with inline styles
 *
 * @param {string} htmlString - Imported HTML string
 * @param {string} cssString - Imported CSS string
 * @returns {string} Combined HTML with inline <style> element
 */
export function combineTemplateWithStyles(htmlString, cssString) {
  // If the HTML already has a <style> tag, append to it
  if (htmlString.includes("<style>")) {
    return htmlString.replace("<style>", `<style>${cssString}`);
  }

  // Otherwise add the style tag at the beginning
  return `<style>${cssString}</style>${htmlString}`;
}

/**
 * Applies styles to a shadow root using Constructable Stylesheets if supported
 *
 * @param {ShadowRoot} shadowRoot - The shadow root to apply styles to
 * @param {string} cssString - CSS string to apply
 * @param {CSSStyleSheet[]} documentSheets - Optional array of document stylesheets to inherit
 * @returns {boolean} True if styles were applied using Constructable Stylesheets
 */
export function applyStyles(shadowRoot, cssString, documentSheets = []) {
  try {
    // Check if Constructable Stylesheets are supported
    if (
      !("CSSStyleSheet" in window) ||
      !("replaceSync" in CSSStyleSheet.prototype)
    ) {
      return false;
    }

    // Create component-specific stylesheet
    const componentSheet = new CSSStyleSheet();
    componentSheet.replaceSync(cssString);

    // Apply document stylesheets + component stylesheet
    if (documentSheets.length > 0) {
      shadowRoot.adoptedStyleSheets = [...documentSheets, componentSheet];
    } else {
      // Just use component styles if no document stylesheets provided
      shadowRoot.adoptedStyleSheets = [componentSheet];
    }

    return true;
  } catch (error) {
    console.error(
      "Error applying styles with Constructable Stylesheets:",
      error,
    );
    return false;
  }
}
