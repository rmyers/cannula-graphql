import { applyStyles, loadTemplate } from "../../template-loader.js";
import toastTemplate from "./toast.html";
import toastStyles from "./toast.css";

/**
 * Toast notification component
 * @element toast-element
 * @attr {string} type - Toast type: 'success', 'error', 'info', 'warning'
 * @attr {string} message - Toast message text
 * @attr {number} duration - Display duration in milliseconds
 * @attr {boolean} auto-hide - Whether to automatically hide the toast
 */
export class ToastElement extends HTMLElement {
  constructor() {
    super();

    // Create shadow DOM
    this.attachShadow({ mode: "open" });

    // Apply styles
    applyStyles(this.shadowRoot, toastStyles, document.adoptedStyleSheets);
    loadTemplate(toastTemplate, this.shadowRoot);

    // Initialize properties
    this._duration = 3000;
    this._autoHide = true;
    this._timerId = null;
    this._type = "info";

    // Get required elements
    this.messageElement = this.shadowRoot.querySelector(".message");
    this.closeButton = this.shadowRoot.querySelector(".close-btn");

    // Add event listener for close button
    this.closeButton.addEventListener("click", () => this.hide());
  }

  /**
   * Web component lifecycle: When attributes change
   */
  static get observedAttributes() {
    return ["type", "message", "duration", "auto-hide"];
  }

  /**
   * Web component lifecycle: Component added to DOM
   */
  connectedCallback() {
    // Initialize from attributes if present
    if (this.hasAttribute("message")) {
      this.messageElement.textContent = this.getAttribute("message");
    }

    if (this.hasAttribute("type")) {
      this.type = this.getAttribute("type");
    } else {
      // Apply default type
      this.classList.add(this._type);
    }

    if (this.hasAttribute("duration")) {
      this._duration = parseInt(this.getAttribute("duration"), 10);
    }

    if (this.hasAttribute("auto-hide")) {
      this._autoHide = this.getAttribute("auto-hide") !== "false";
    }
  }

  /**
   * Web component lifecycle: Attribute changed
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "message" && this.messageElement) {
      this.messageElement.textContent = newValue;
    } else if (name === "type" && newValue) {
      this.type = newValue;
    } else if (name === "duration" && newValue) {
      this._duration = parseInt(newValue, 10);
    } else if (name === "auto-hide") {
      this._autoHide = newValue !== "false";
    }
  }

  /**
   * Type getter
   */
  get type() {
    return this._type;
  }

  /**
   * Type setter
   */
  set type(value) {
    if (this._type) {
      this.classList.remove(this._type);
    }

    this._type = value;
    this.classList.add(value);
  }

  /**
   * Message getter
   */
  get message() {
    return this.messageElement ? this.messageElement.textContent : "";
  }

  /**
   * Message setter
   */
  set message(value) {
    if (this.messageElement) {
      this.messageElement.textContent = value;
    }
  }

  /**
   * Duration getter
   */
  get duration() {
    return this._duration;
  }

  /**
   * Duration setter
   */
  set duration(value) {
    this._duration = value;
  }

  /**
   * Auto-hide getter
   */
  get autoHide() {
    return this._autoHide;
  }

  /**
   * Auto-hide setter
   */
  set autoHide(value) {
    this._autoHide = value;
  }

  /**
   * Show the toast notification
   * @returns {ToastElement} This instance for chaining
   */
  show() {
    if (this._timerId) {
      clearTimeout(this._timerId);
      this._timerId = null;
    }

    this.classList.add("visible");

    if (this._autoHide) {
      this._timerId = setTimeout(() => {
        this.hide();
      }, this._duration);
    }

    return this;
  }

  /**
   * Hide the toast notification
   * @returns {ToastElement} This instance for chaining
   */
  hide() {
    this.classList.remove("visible");

    if (this._timerId) {
      clearTimeout(this._timerId);
      this._timerId = null;
    }

    this.dispatchEvent(new CustomEvent("toast-hidden"));

    return this;
  }
}

// Helper function
export function showToast(options = {}) {
  const {
    message = "",
    type = "info",
    duration = 3000,
    autoHide = true,
  } = options;

  const toast = document.createElement("toast-element");
  toast.message = message;
  toast.type = type;
  toast.duration = duration;
  toast.autoHide = autoHide;

  document.body.appendChild(toast);
  toast.show();

  toast.addEventListener("toast-hidden", () => {
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 200);
  });

  return toast;
}

// Export for CommonJS
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ToastElement, showToast };
}

// Export for global usage
if (typeof window !== "undefined") {
  window.ToastElement = ToastElement;
  window.showToast = showToast;
}
