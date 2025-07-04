/**
 * Trusted domains that don't require confirmation dialogs when linked from AI responses
 * These are well-known, safe domains commonly referenced in hackathon and development contexts
 */

export const TRUSTED_DOMAINS = new Set([
  // Documentation and Developer Resources
  'developer.mozilla.org',
  'docs.microsoft.com',
  'docs.oracle.com',
  'docs.python.org',
  'nodejs.org',
  'reactjs.org',
  'vuejs.org',
  'angular.io',
  'svelte.dev',
  'nextjs.org',
  'nuxtjs.org',
  
  // Code Repositories and Development Platforms
  'github.com',
  'gitlab.com',
  'bitbucket.org',
  'codepen.io',
  'codesandbox.io',
  'jsfiddle.net',
  'replit.com',
  'glitch.com',
  
  // Learning and Tutorial Platforms
  'stackoverflow.com',
  'stackexchange.com',
  'freecodecamp.org',
  'codecademy.com',
  'udemy.com',
  'coursera.org',
  'edx.org',
  'khanacademy.org',
  'pluralsight.com',
  'egghead.io',
  
  // Package Managers and Registries
  'npmjs.com',
  'pypi.org',
  'packagist.org',
  'crates.io',
  'pub.dev',
  'nuget.org',
  'maven.apache.org',
  'rubygems.org',
  
  // Cloud Platforms and Services
  'aws.amazon.com',
  'cloud.google.com',
  'azure.microsoft.com',
  'heroku.com',
  'netlify.com',
  'vercel.com',
  'digitalocean.com',
  'cloudflare.com',
  
  // Developer Tools and IDEs
  'code.visualstudio.com',
  'jetbrains.com',
  'sublimetext.com',
  'atom.io',
  'eclipse.org',
  
  // API and Database Documentation
  'stripe.com',
  'twilio.com',
  'mongodb.com',
  'postgresql.org',
  'mysql.com',
  'redis.io',
  'firebase.google.com',
  'supabase.com',
  
  // Design and UI Resources
  'figma.com',
  'sketch.com',
  'adobe.com',
  'canva.com',
  'dribbble.com',
  'behance.net',
  'unsplash.com',
  'pexels.com',
  
  // Tech News and Blogs
  'techcrunch.com',
  'dev.to',
  'medium.com',
  'hackernews.ycombinator.com',
  'smashingmagazine.com',
  'css-tricks.com',
  'a11yproject.com',
  
  // Standards and Specifications
  'w3.org',
  'whatwg.org',
  'tc39.es',
  'ecma-international.org',
  'rfc-editor.org',
  
  // Popular Libraries and Frameworks
  'jquery.com',
  'getbootstrap.com',
  'tailwindcss.com',
  'bulma.io',
  'foundation.zurb.com',
  'materializecss.com',
  'semantic-ui.com',
  'chakra-ui.com',
  'mui.com',
  'ant.design',
  
  // Testing and Development Tools
  'jestjs.io',
  'mochajs.org',
  'jasmine.github.io',
  'cypress.io',
  'selenium.dev',
  'puppeteer.dev',
  'playwright.dev',
  
  // Build Tools and Bundlers
  'webpack.js.org',
  'rollupjs.org',
  'vitejs.dev',
  'parceljs.org',
  'gulpjs.com',
  'gruntjs.com',
  
  // General Tech and Reference
  'wikipedia.org',
  'google.com',
  'youtube.com',
  'linkedin.com',
  'twitter.com',
  'reddit.com',
  'discord.com',
  'slack.com',
  
  // Hackathon and Competition Platforms
  'devpost.com',
  'hackerearth.com',
  'codechef.com',
  'codeforces.com',
  'topcoder.com',
  'kaggle.com',
  'leetcode.com',
  'hackerrank.com'
])

/**
 * Check if a domain is in the trusted domains list
 * @param domain - The domain to check (e.g., 'github.com')
 * @returns true if the domain is trusted, false otherwise
 */
export function isTrustedDomain(domain: string): boolean {
  // Normalize domain by removing www. prefix and converting to lowercase
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '')
  return TRUSTED_DOMAINS.has(normalizedDomain)
}

/**
 * Check if a URL points to a trusted domain
 * @param url - The full URL to check
 * @returns true if the URL's domain is trusted, false otherwise
 */
export function isTrustedUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return isTrustedDomain(urlObj.hostname)
  } catch {
    // If URL parsing fails, treat as untrusted
    return false
  }
}

/**
 * Get the total number of trusted domains
 * @returns number of domains in the trusted list
 */
export function getTrustedDomainsCount(): number {
  return TRUSTED_DOMAINS.size
}

/**
 * Get all trusted domains as an array (for debugging/admin purposes)
 * @returns array of all trusted domain strings
 */
export function getAllTrustedDomains(): string[] {
  return Array.from(TRUSTED_DOMAINS).sort()
}