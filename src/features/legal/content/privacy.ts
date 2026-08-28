import type { LegalDocument } from "../types";
import { LEGAL_COMPANY, LEGAL_PRIVACY_LAST_UPDATED } from "../constants";

const { name, brand, companyNumber, email } = LEGAL_COMPANY;

export const privacyPolicy: LegalDocument = {
  title: "Privacy Policy",
  lastUpdated: LEGAL_PRIVACY_LAST_UPDATED,
  intro: [
    `This Privacy Policy explains how ${name} ("${brand}", "we", "us" or "our") collects, uses, shares and protects your personal information when you use the ${brand} website and app (the "Service"). We are committed to handling your data responsibly and in line with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.`,
    `By creating an account or using the Service, you acknowledge that you have read and understood this policy.`,
  ],
  sections: [
    {
      heading: "1. Who we are",
      blocks: [
        `${name} is a company registered in England and Wales (company number ${companyNumber}). We are the "data controller" responsible for your personal information. If you have any questions about this policy or how we use your data, you can contact us at [${email}](mailto:${email}).`,
      ],
    },
    {
      heading: "2. Information we collect",
      blocks: [
        "We collect the following categories of information:",
        {
          list: [
            "Account information — your name, email address and password (passwords are stored in encrypted form by our authentication provider, never in plain text). If you sign in with Google, we receive your name and email address from Google.",
            "Onboarding and account details — your chosen monthly pledge amount and your onboarding status.",
            "Payment and Direct Debit information — bank account and mandate details, payment amounts, payment status and transaction history. Your full bank details are collected and processed by our payment provider (GoCardless), not stored directly by us.",
            "Wallet and redemption activity — your Treatcode balance, ledger history, and the vouchers you request and redeem.",
            "Technical and usage data — information such as your device, browser, IP address and how you interact with the Service.",
          ],
        },
      ],
    },
    {
      heading: "3. How we use your information",
      blocks: [
        "We use your information to:",
        {
          list: [
            "Create and manage your account and authenticate you when you sign in.",
            "Set up and collect your recurring deposits via Direct Debit, and credit your Treatcode balance.",
            "Process your voucher redemptions and deliver voucher codes to you.",
            "Send you service communications, such as confirmations, payment notifications and voucher delivery emails.",
            "Maintain the security of the Service, prevent fraud and comply with our legal obligations.",
            "Improve, troubleshoot and develop the Service.",
          ],
        },
      ],
    },
    {
      heading: "4. Our legal bases for using your data",
      blocks: [
        "Under UK GDPR we rely on the following legal bases:",
        {
          list: [
            "Contract — to provide the Service you have signed up for, including processing deposits and redemptions.",
            "Legal obligation — to meet our regulatory, accounting and anti-fraud obligations.",
            "Legitimate interests — to keep the Service secure, prevent fraud, and improve our products, provided your rights do not override these interests.",
            "Consent — where required, for example certain optional communications. You can withdraw consent at any time.",
          ],
        },
      ],
    },
    {
      heading: "5. How we share your information",
      blocks: [
        "We do not sell your personal information. We share it only with trusted service providers who help us run the Service, including:",
        {
          list: [
            "GoCardless — to set up Direct Debit mandates and collect your deposits.",
            "Supabase — our backend platform, which hosts our database and authentication.",
            "Google — where you choose to sign in with your Google account.",
            "Email and notification providers — to send you transactional emails.",
            "Retail partners — to issue the gift vouchers you redeem.",
          ],
        },
        "We may also disclose information where required by law, to enforce our terms, or to protect the rights, property or safety of Treatcode, our users or others.",
      ],
    },
    {
      heading: "6. International transfers",
      blocks: [
        "Some of our service providers may process your data outside the UK. Where this happens, we take steps to ensure your information receives an adequate level of protection, such as relying on UK adequacy regulations or appropriate safeguards like Standard Contractual Clauses.",
      ],
    },
    {
      heading: "7. How long we keep your information",
      blocks: [
        "We keep your personal information for as long as your account is active and for as long afterwards as necessary to comply with our legal, accounting and regulatory obligations, resolve disputes and enforce our agreements. When information is no longer needed, we securely delete or anonymise it.",
      ],
    },
    {
      heading: "8. How we protect your information",
      blocks: [
        "We use technical and organisational measures to protect your data, including encryption in transit, access controls and row-level security on our database. No method of transmission or storage is completely secure, but we work continuously to safeguard your information.",
      ],
    },
    {
      heading: "9. Your rights",
      blocks: [
        "Subject to applicable law, you have the right to:",
        {
          list: [
            "Access the personal information we hold about you.",
            "Request correction of inaccurate or incomplete information.",
            "Request erasure of your information in certain circumstances.",
            "Object to or restrict our processing of your information.",
            "Request portability of your information.",
            "Withdraw consent where we rely on it.",
          ],
        },
        `To exercise any of these rights, contact us at [${email}](mailto:${email}). You also have the right to lodge a complaint with the UK's Information Commissioner's Office (ICO) at ico.org.uk.`,
      ],
    },
    {
      heading: "10. Cookies and similar technologies",
      blocks: [
        "We use cookies and similar technologies that are necessary to operate the Service, such as keeping you signed in and remembering your session. We do not use them to track you across other websites.",
      ],
    },
    {
      heading: "11. Children",
      blocks: [
        "The Service is not intended for anyone under 18, and we do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us so we can remove it.",
      ],
    },
    {
      heading: "12. Changes to this policy",
      blocks: [
        "We may update this Privacy Policy from time to time. When we make material changes, we will update the date at the top of this page and, where appropriate, notify you. Please review this page periodically.",
      ],
    },
    {
      heading: "13. Contact us",
      blocks: [
        `If you have any questions, concerns or requests regarding this policy or your personal information, please contact us at [${email}](mailto:${email}).`,
      ],
    },
  ],
};
