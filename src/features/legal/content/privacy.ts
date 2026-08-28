import type { LegalDocument } from "../types";
import { LEGAL_COMPANY, LEGAL_PRIVACY_LAST_UPDATED } from "../constants";

const { name, brand, companyNumber, jurisdiction, email, registeredOffice } =
  LEGAL_COMPANY;

export const privacyPolicy: LegalDocument = {
  title: `${brand} Privacy Notice`,
  lastUpdated: LEGAL_PRIVACY_LAST_UPDATED,
  intro: [
    `This Privacy Notice explains how ${name} collects, uses, stores and protects your personal information when you use the ${brand} website, application and related services (together, the "Service").`,
    "We aim to keep this notice clear and straightforward. It explains what information we collect, why we need it, who we may share it with and the rights you have in relation to your personal information.",
  ],
  sections: [
    {
      heading: "1. Who we are",
      blocks: [
        `The ${brand} Service is operated by:`,
        {
          lines: [
            `**${name}**`,
            `Company number: **${companyNumber}**`,
            `Registered in ${jurisdiction}`,
            `Registered office: **${registeredOffice}**`,
            `Email: [${email}](mailto:${email})`,
          ],
        },
        `${name} is the organisation responsible for deciding how and why your personal information is processed in connection with the Service. In data protection law, we are the **data controller**.`,
        "If you have any questions about this Privacy Notice or how we use your information, please contact us using the email address above.",
      ],
    },
    {
      heading: "2. What personal information we collect",
      blocks: [
        `The information we collect depends on how you use ${brand}.`,
        { subheading: "Information you provide when creating an account" },
        `When you create a ${brand} account, we may collect:`,
        {
          list: [
            "your name;",
            "your email address;",
            `your ${brand} account details;`,
            `your unique ${brand} customer reference; and`,
            "information needed to maintain and secure your account.",
          ],
        },
        "You may create an account using your email address or, where available, by using Google sign-in.",
        `If you choose to sign in using Google, we receive your email address from Google for the purpose of creating and managing your ${brand} account. We do not receive your Google password.`,
        { subheading: "Information relating to payments" },
        `${brand} uses standing orders for monthly purchases.`,
        `You set up the standing order directly with your bank using the payment information and unique customer reference provided by ${brand}. ${brand} does not initiate the standing order on your behalf and does not require your bank account number or sort code in order for you to use the Service.`,
        `When a payment is made to ${brand}, we may process information such as:`,
        {
          list: [
            "the amount received;",
            "the date the payment was received;",
            "the unique customer reference associated with the payment;",
            "whether the payment was successfully received, failed, reversed or returned; and",
            `the resulting transaction and balance information on your ${brand} account.`,
          ],
        },
        `We use this information to identify payments, update your ${brand} balance and maintain an accurate transaction history.`,
        { subheading: `Information about your use of ${brand}` },
        "We may collect information about your use of the Service, including:",
        {
          list: [
            `your ${brand} balance;`,
            "payments and transactions credited to your account;",
            "voucher requests;",
            "vouchers issued to you;",
            "information relating to refunds;",
            "information relating to account closure; and",
            "communications you have with us about your account or the Service.",
          ],
        },
        { subheading: "Information relating to security and misuse" },
        "We may collect and use information where reasonably necessary to:",
        {
          list: [
            "protect accounts and the Service;",
            "investigate suspected fraud or misuse;",
            "investigate security incidents;",
            "enforce our [Terms of Service](/terms); or",
            "comply with legal or regulatory requirements.",
          ],
        },
        "Our [Terms of Service](/terms) allow us to take reasonable steps where we believe there is a security, fraud or other risk. We will only collect and use information for these purposes where reasonably necessary.",
        { subheading: "Technical information" },
        "When you use a website or online service, technical information may be generated or processed as part of operating and securing that service.",
        "Depending on how the Service is accessed, this may include information such as IP address, browser type, device information, technical logs and information about requests made to our systems.",
        "We use this information where necessary to operate, maintain and secure the Service.",
      ],
    },
    {
      heading: "3. Why we use your information",
      blocks: [
        "We use personal information for the following purposes:",
        { subheading: `Providing ${brand} to you` },
        "We use your information to:",
        {
          list: [
            `create and maintain your ${brand} account;`,
            "identify your account and payments;",
            `maintain your ${brand} balance and transaction history;`,
            "provide vouchers through the Service;",
            "process refunds where applicable;",
            "communicate with you about your account and the Service; and",
            "provide customer support.",
          ],
        },
        { subheading: "Operating and improving the Service" },
        "We may use information to:",
        {
          list: [
            "maintain and administer the Service;",
            "troubleshoot technical problems;",
            "maintain security;",
            "prevent fraud, misuse and unauthorised access; and",
            "make reasonable improvements to the Service.",
          ],
        },
        { subheading: "Legal and regulatory purposes" },
        "We may use and retain information where necessary to:",
        {
          list: [
            "comply with our legal obligations;",
            "respond to lawful requests from regulators or law-enforcement authorities;",
            "establish, exercise or defend legal claims; and",
            "maintain records where we are legally required to do so.",
          ],
        },
      ],
    },
    {
      heading: "4. Our lawful bases for using your information",
      blocks: [
        "Data protection law requires us to have a lawful basis for processing personal information.",
        "The lawful basis we use depends on what we are doing with the information.",
        { subheading: "Contract" },
        `Most of the information we process is necessary for us to provide the ${brand} Service to you and to perform our agreement with you.`,
        `For example, we need your account information and email address to maintain your account and communicate with you. We also need to process payment and transaction information to identify payments and maintain your ${brand} balance.`,
        { subheading: "Legal obligation" },
        `We may process information where necessary for ${brand} to comply with a legal obligation, including legal, accounting, tax, regulatory or reporting requirements.`,
        { subheading: "Legitimate interests" },
        "We may process information where this is necessary for our legitimate interests, provided those interests are not overridden by your rights and interests.",
        "These interests may include:",
        {
          list: [
            `maintaining and securing the ${brand} Service;`,
            "preventing fraud and misuse;",
            "protecting our business and our users;",
            "investigating technical or security issues;",
            "responding to customer enquiries;",
            "maintaining appropriate business records; and",
            "establishing, exercising or defending legal claims.",
          ],
        },
        { subheading: "Consent" },
        "Where we rely on your consent to process personal information, we will ask for that consent separately.",
        "Where processing is based on consent, you can withdraw your consent at any time. Withdrawing consent does not affect processing that took place before you withdrew it.",
        `We do not currently rely on consent for routine processing that is necessary to provide the ${brand} Service.`,
      ],
    },
    {
      heading: "5. Information obtained from Google",
      blocks: [
        `If you choose to create or access your ${brand} account using Google sign-in, Google provides ${brand} with the email address associated with your Google Account.`,
        `We use this email address to create or access your ${brand} account and to communicate with you about the ${brand} Service.`,
        "We do not ask Google for access to other information in your Google Account, such as your contacts, files or messages.",
        "We do not receive your Google password.",
        "If you choose to use Google sign-in, Google's own privacy policies also apply to information that Google processes when you use its services.",
      ],
    },
    {
      heading: "6. Who we share your information with",
      blocks: [
        "We do not sell your personal information.",
        `We may share personal information with service providers where this is necessary for us to operate ${brand}.`,
        "These currently include:",
        { subheading: "Supabase" },
        `We use **Supabase** to provide database and backend infrastructure for the ${brand} Service. Information required to operate your ${brand} account and maintain your transactions may therefore be stored or processed using Supabase's infrastructure.`,
        { subheading: "Vercel" },
        `We use **Vercel** to host and deliver the ${brand} website and application. Technical information may therefore be processed by Vercel as part of providing hosting and related infrastructure services.`,
        { subheading: "Google" },
        `We use Google services for account sign-in where you choose Google sign-in and for ${brand}'s business email service.`,
        { subheading: "Participating retailers and other service providers" },
        "Where necessary to provide a voucher or otherwise fulfil a service you have requested, we may provide relevant information to a participating retailer or another service provider involved in fulfilling that request.",
        "We will only provide information that is reasonably necessary for the relevant purpose.",
        { subheading: "Legal and regulatory authorities" },
        "We may disclose personal information where required or permitted by law, including to regulators, government bodies, law-enforcement authorities, courts or professional advisers where appropriate.",
      ],
    },
    {
      heading: "7. International transfers",
      blocks: [
        "Some of the service providers we use may process personal information in countries outside the United Kingdom.",
        "Where personal information is transferred outside the UK, we will ensure that the transfer is made in accordance with applicable data protection law and that appropriate safeguards are in place where required.",
        "Because the services we use may change over time, the specific location and legal mechanism applicable to a particular transfer may depend on the provider and the services we use.",
        "You can contact us if you would like further information about international transfers involving your personal information.",
      ],
    },
    {
      heading: "8. How we protect your information",
      blocks: [
        "We take reasonable technical and organisational measures to protect personal information against unauthorised access, loss, misuse, alteration or disclosure.",
        `Access to the ${brand} database is restricted to authorised ${brand} personnel who need access to operate and administer the Service.`,
        "We also use established third-party infrastructure providers to operate parts of the Service, including database/backend infrastructure and hosting.",
        "No online service can be guaranteed to be completely secure. If we become aware of a personal data breach that we are legally required to notify you about, we will do so in accordance with applicable law.",
      ],
    },
    {
      heading: "9. How long we keep your information",
      blocks: [
        "We keep personal information only for as long as we reasonably need it for the purposes described in this Privacy Notice.",
        "The length of time we keep information depends on the type of information and why we need it.",
        "For example:",
        {
          list: [
            `account information will normally be kept while your ${brand} account remains active and for a reasonable period afterwards where necessary;`,
            "transaction and payment records may need to be retained for longer to meet legal, accounting, tax, regulatory or dispute-resolution requirements;",
            "information relating to refunds, complaints or disputes may be retained for as long as reasonably necessary to deal with the matter and protect our legal rights; and",
            "technical and security information may be retained for an appropriate period for security, troubleshooting and operational purposes.",
          ],
        },
        "When information is no longer required, we will securely delete it or anonymise it where appropriate.",
      ],
    },
    {
      heading: "10. Cookies and similar technologies",
      blocks: [
        `${brand} does not currently use advertising cookies or analytics services to track how you use the Service.`,
        "We may use cookies or similar technologies that are strictly necessary to provide functionality such as keeping you signed in, maintaining security or operating the Service.",
        "If we introduce analytics, advertising or other non-essential tracking technologies in the future, we will update this Privacy Notice and, where required, ask for your consent before using them.",
      ],
    },
    {
      heading: "11. Your data protection rights",
      blocks: [
        "Depending on the circumstances, you have rights under data protection law in relation to your personal information.",
        "These may include the right to:",
        {
          list: [
            "**access** the personal information we hold about you;",
            "**correct** inaccurate or incomplete information;",
            "**request erasure** of your personal information in certain circumstances;",
            "**request restriction** of processing in certain circumstances;",
            "**object** to certain processing, including processing based on legitimate interests;",
            "**receive or request transfer** of certain information in a usable format where the right to data portability applies; and",
            "**withdraw consent** where we are relying on consent as the lawful basis for processing.",
          ],
        },
        "These rights are not absolute and may not apply in every situation. For example, we may need to retain certain information to comply with a legal obligation or to establish, exercise or defend legal claims.",
        "If you want to exercise one of these rights, contact us at:",
        `[${email}](mailto:${email})`,
        "We may need to verify your identity before responding to a request.",
      ],
    },
    {
      heading: "12. Your right to object",
      blocks: [
        "Where we process your personal information based on legitimate interests, you have the right to object to that processing.",
        `If you wish to object, please contact us at [${email}](mailto:${email}) and explain what processing you are objecting to.`,
        "We will consider your objection in accordance with applicable data protection law.",
      ],
    },
    {
      heading: "13. Complaints",
      blocks: [
        "If you have concerns about how we have handled your personal information, please contact us first at:",
        `[${email}](mailto:${email})`,
        "We will try to resolve your concern promptly.",
        "You also have the right to complain to the **Information Commissioner's Office (ICO)**, the UK's data protection regulator.",
        "The ICO's website is:",
        "[https://ico.org.uk/](https://ico.org.uk/)",
        "The ICO's helpline is:",
        "**0303 123 1113**",
        "You can find further information about making a complaint on the ICO's website.",
      ],
    },
    {
      heading: "14. Children's information",
      blocks: [
        `The ${brand} Service is available only to people aged **16 or over**.`,
        "Our [Terms of Service](/terms) require users to be at least 16 years old and resident in the United Kingdom.",
        "We do not knowingly seek to collect personal information from anyone under 16.",
        "If you believe that someone under 16 has provided us with personal information, please contact us so that we can investigate and take appropriate action.",
      ],
    },
    {
      heading: "15. Automated decision-making",
      blocks: [
        "We do not currently make decisions about you that are based solely on automated processing, including profiling, where those decisions have legal or similarly significant effects on you.",
        "If this changes, we will update this Privacy Notice and provide the information required by applicable data protection law.",
      ],
    },
    {
      heading: "16. Changes to this Privacy Notice",
      blocks: [
        "We may update this Privacy Notice from time to time to reflect:",
        {
          list: [
            `changes to the ${brand} Service;`,
            "changes to the information we collect or how we use it;",
            "changes to our service providers;",
            "changes in technology;",
            "changes in law or regulation; or",
            "changes to how we operate the Service.",
          ],
        },
        'We will update the **"Last updated"** date at the beginning of this Privacy Notice when changes are made.',
        "Where a change is significant, we will take reasonable steps to bring it to your attention where appropriate.",
      ],
    },
    {
      heading: "17. Contact us",
      blocks: [
        `If you have any questions about this Privacy Notice or how ${brand} uses your personal information, please contact:`,
        {
          lines: [
            `**${name}**`,
            `Company number: **${companyNumber}**`,
            `Registered office: **${registeredOffice}**`,
            `Email: [${email}](mailto:${email})`,
          ],
        },
      ],
    },
  ],
};
