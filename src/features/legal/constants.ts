// Single source of truth for company / contact details used across the legal pages.
export const LEGAL_COMPANY = {
  name: "Treat Code Ltd",
  brand: "Treatcode",
  companyNumber: "16429228",
  jurisdiction: "England and Wales",
  email: "treatcode@treat-code.com",
  registeredOffice: "7 Banton Close, Birmingham, B23 5YT",
  trademarkNumber: "UK00004390524",
} as const;

// Bump this whenever the privacy policy is materially updated.
export const LEGAL_PRIVACY_LAST_UPDATED = "24 June 2026";

// Bump this whenever the terms of service are materially updated.
export const LEGAL_TERMS_LAST_UPDATED = "27 August 2026";
