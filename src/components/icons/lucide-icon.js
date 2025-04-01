import { applyStyles, loadTemplate } from "../../template-loader.js";
import iconTemplate from "./lucide-icon.html";
import iconStyles from "./lucide-icon.css";

/**
 * Available icons these are copied from Lucide https://lucide.dev/icons/
 *
 * To add a new one just pick a name copy the contents of the svg here. Only include the
 * contents of the svg and remove the <svg *></svg> tags as that is added by the component.
 */
const icons = {
  menu: '<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
  settings:
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  // Add toast notification icons
  success:
    '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>',
  info: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>',
  warning:
    '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>',
  error:
    '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>',
  x: '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
};

/**
 * LucideIcon web component
 * @element lucide-icon
 * @attr {string} name - Icon name
 * @attr {string} size - Icon size: 'small', 'default', 'large'
 * @attr {string} variant - Icon variant: 'primary', 'success', 'error', 'info', 'warning', 'muted'
 * @attr {string} color - Custom icon color
 */
export class LucideIcon extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Apply styles and load template
    applyStyles(this.shadowRoot, iconStyles, document.adoptedStyleSheets);
    loadTemplate(iconTemplate, this.shadowRoot);

    // Get the SVG element
    this.svgElement = this.shadowRoot.querySelector("svg");
  }

  static get observedAttributes() {
    return ["name", "size", "variant", "color"];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const name = this.getAttribute("name");
    const color = this.getAttribute("color");
    const iconPath = icons[name] || "";

    // Update SVG content with the selected icon
    if (this.svgElement) {
      this.svgElement.innerHTML = iconPath;

      // Apply custom color if specified
      if (color) {
        this.svgElement.style.color = color;
      } else {
        this.svgElement.style.color = "";
      }
    }
  }
}
