/**
 * Valid Content Security Policy (CSP) directive names.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
 */

export const isNodeProduction = process.env.NODE_ENV === "production";
const directives = [
  "default-src",
  "script-src",
  "style-src",
  "font-src",
  "media-src",
  "img-src",
  "connect-src",
  "frame-ancestors",
  "worker-src",
  "report-uri",
  "report-to",
  "frame-src",
] as const;
type CSPDirective = (typeof directives)[number];

/**
 * Builder class for constructing Content Security Policy (CSP) headers.
 * Provides a fluent interface for adding CSP directives and their values.
 *
 * @example
 * const csp = new CSPBuilder()
 *   .add('default-src', ["'self'"])
 *   .add('script-src', ["'self'", "'unsafe-eval'"]);
 *
 * const headers = {
 *   '/*': [{
 *     key: 'Content-Security-Policy',
 *     value: csp.build()
 *   }]
 * };
 */
class CSPBuilder {
  /** Map of CSP directives to their allowed sources */
  private directives: Map<CSPDirective, Set<string>> = new Map();

  constructor() {
    // Initialize with empty sets for each directive
    directives.forEach((d) => this.directives.set(d, new Set()));
  }

  /**
   * Adds sources to a CSP directive.
   * Duplicate values are automatically removed via Set.
   *
   * @param directive - The CSP directive to add sources to
   * @param values - Array of sources to add to the directive
   * @returns this for method chaining
   *
   * @example
   * csp.add('script-src', ["'self'", "'unsafe-eval'"]);
   */
  add(directive: CSPDirective, values: string[]): this {
    const set = this.directives.get(directive);
    if (set) {
      values.forEach((value) => set.add(value));
    }
    return this;
  }

  /**
   * Builds the final CSP header value string.
   * Only includes directives that have at least one source value.
   *
   * @returns Formatted CSP header value string
   *
   * @example
   * // Returns: "default-src 'self'; script-src 'self' 'unsafe-eval'"
   * csp.build();
   */
  build(): string {
    return Array.from(this.directives.entries())
      .filter(([, values]) => values.size > 0)
      .map(
        ([directive, values]) => `${directive} ${Array.from(values).join(" ")}`,
      )
      .join("; ");
  }
}

// Allows us to easily substitute a production-only header at deploy time
function envHeader(varName: string): string {
  const value = isNodeProduction
    ? `__TEMPLATE_VAR_${varName}__`
    : process.env[varName];
  if (!value) {
    throw new Error(`Missing environment variable: ${varName}`);
  }
  return value;
}

// Base CSP configuration
const csp = new CSPBuilder()
  .add("default-src", ["'self'"])
  .add("script-src", [
    "'self'",
    "unpkg.com",
    envHeader("VITE_INDEX_ENV_SCRIPT_INTEGRITY"),
  ])
  .add("style-src", [
    "'self'",
    "'unsafe-inline'",
    "fonts.gstatic.com",
    "fonts.googleapis.com",
    "rsms.me",
    "*.posthog.com",
  ])
  .add("font-src", [
    "data:",
    "fonts.gstatic.com",
    "fonts.googleapis.com",
    "rsms.me",
  ])
  .add("media-src", ["blob:"])
  .add("img-src", ["'self'", "blob:", "data:", "https:", "ipfs.io"])
  .add("connect-src", [
    "'self'",
    "data:",
    "blob:",
    "unpkg.com",
    "fonts.gstatic.com",
    "*.sentry.io",
  ])
  .add("frame-src", [
    "'self'",
    ...(!isNodeProduction ? [envHeader("VITE_WEBAUTHN_IFRAME_SRC")] : []),
  ])
  .add("frame-ancestors", ["'self'", envHeader("VITE_DAPP_ORIGINS")])
  .add("worker-src", ["blob:"])
  .add("frame-src", ["https://challenges.cloudflare.com"])
  .add("report-to", ["csp-endpoint"]);

export const headers = {
  "/*": [
    {
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains; preload",
    },
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    {
      key: "X-Frame-Options",
      value: "DENY",
    },
    {
      key: "X-XSS-Protection",
      value: "1; mode=block",
    },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    {
      key: "Content-Security-Policy",
      value: csp.build(),
    },
    {
      key: "Reporting-Endpoints",
      value: `csp-endpoint=${envHeader("VITE_CSP_REPORTING_ENDPOINT")}`,
    },
    {
      key: "Permissions-Policy",
      value: "geolocation=(), camera=(), microphone=()",
    },
  ],
};
