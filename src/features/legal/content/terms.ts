import type { LegalDocument } from "../types";
import { LEGAL_COMPANY, LEGAL_TERMS_LAST_UPDATED } from "../constants";

const {
  name,
  brand,
  companyNumber,
  jurisdiction,
  email,
  registeredOffice,
  trademarkNumber,
} = LEGAL_COMPANY;

export const termsOfService: LegalDocument = {
  title: "Terms of Service",
  lastUpdated: LEGAL_TERMS_LAST_UPDATED,
  intro: [
    `These Terms of Service ("Terms") govern your access to and use of the ${brand} website, application and related services (together, the "Service").`,
    `The Service is operated by **${name}**, a company registered in England and Wales under company number **${companyNumber}** ("${brand}", "we", "us" or "our").`,
    `By creating an account or using the Service, you agree to these Terms. If you do not agree to them, you must not create an account or use the Service.`,
    `These Terms are intended to explain clearly how ${brand} works, your rights and responsibilities, and the terms on which we provide the Service.`,
  ],
  sections: [
    {
      heading: "1. About these Terms",
      blocks: [
        {
          clauses: [
            {
              number: "1.1",
              text: `These Terms form a legally binding agreement between you and ${name} when you create a ${brand} account or use the Service.`,
            },
            {
              number: "1.2",
              text: `Please read these Terms together with any other terms or policies that apply to your use of the Service, including our [Privacy Policy](/privacy) and any terms applicable to vouchers supplied by participating retailers.`,
            },
            {
              number: "1.3",
              text: "If there is a conflict between these Terms and a mandatory right or protection you have under applicable consumer law, the mandatory legal right or protection will prevail.",
            },
            {
              number: "1.4",
              text: "Nothing in these Terms is intended to exclude or restrict any rights you have which cannot legally be excluded or restricted.",
            },
          ],
        },
      ],
    },
    {
      heading: `2. About ${name}`,
      blocks: [
        `${brand} is operated by:`,
        {
          lines: [
            `**${name}**`,
            `Company number: **${companyNumber}**`,
            "Registered in England and Wales",
            `Registered office: **${registeredOffice}**`,
            `Email: [${email}](mailto:${email})`,
          ],
        },
        `${name} is responsible for providing the ${brand} Service described in these Terms.`,
        "Participating retailers are separate businesses and are responsible for the goods and services they provide to you.",
      ],
    },
    {
      heading: `3. What ${brand} is`,
      blocks: [
        `${brand} is a **"Pay Now, Buy Later"** service designed to help you make regular prepaid purchases which can subsequently be exchanged for retailer vouchers.`,
        `You make payments to ${brand}, normally on a monthly basis, using a standing order that you set up with your bank.`,
        `Subject to these Terms, successful payments are recorded against your ${brand} account as an available balance. When you have sufficient available balance, you may request a voucher for a participating retailer.`,
        `${brand} is **not intended to be a savings account, bank account or credit facility**. You do not borrow money from ${brand} and we do not charge interest on your purchases.`,
        `Your ${brand} balance does not earn interest.`,
        "The Service is not intended to provide you with a general-purpose means of making payments or transferring money to third parties.",
      ],
    },
    {
      heading: "4. Regulatory status and the Limited Network Exclusion",
      blocks: [
        `${name} intends that the ${brand} Service falls within the **Limited Network Exclusion ("LNE")** under applicable UK payment services and electronic money legislation.`,
        "The LNE is an exclusion from certain regulatory requirements and is not an FCA authorisation.",
        `${brand} is therefore **not presented as an FCA-authorised payment institution or electronic money institution in respect of the Service**.`,
        "The availability and use of vouchers through the Service are restricted to participating retailers and are subject to the applicable terms and restrictions.",
        "The legal and regulatory treatment of the Service depends on how the Service operates in practice, including the nature of the vouchers, participating retailers, payment flows and other features of the Service. We may change or restrict features of the Service where reasonably necessary to ensure that it continues to operate within the applicable legal and regulatory framework.",
        `Your ${brand} balance is not a bank deposit and is **not protected by the Financial Services Compensation Scheme (FSCS)**.`,
        `Nothing in this section is intended to misrepresent the regulatory status of ${name} or to limit any rights you have under applicable law.`,
      ],
    },
    {
      heading: "5. Eligibility",
      blocks: [
        `To use ${brand}, you must:`,
        {
          list: [
            "be at least **16 years old**;",
            "be resident in the **United Kingdom**; and",
            `have a **UK bank account** from which you can make payments to ${brand}.`,
          ],
        },
        "By creating an account or using the Service, you confirm that these requirements are satisfied.",
        "You must not create or use an account on behalf of another person unless we expressly allow you to do so.",
        "We may request information reasonably necessary to verify your identity, age, eligibility or compliance with these Terms and applicable law.",
        "If you no longer satisfy the eligibility requirements, you must stop using the Service and notify us where appropriate.",
      ],
    },
    {
      heading: "6. Creating and using your account",
      blocks: [
        `You must provide accurate, complete and current information when creating your ${brand} account and whenever we reasonably request updated information.`,
        "You are responsible for keeping your account information accurate.",
        "You are also responsible for keeping your account credentials secure and must take reasonable steps to prevent another person from accessing your account.",
        "You must not:",
        {
          list: [
            "share your password or account credentials with another person;",
            "knowingly allow another person to use your account;",
            "create multiple accounts to circumvent restrictions;",
            "provide false, misleading or fraudulent information; or",
            "use another person's identity or payment information without appropriate authorisation.",
          ],
        },
        `If you believe that your account has been accessed without your permission, contact us as soon as reasonably possible at [${email}](mailto:${email}).`,
        "We may take reasonable steps to protect your account, including temporarily suspending access where we reasonably believe there is a security, fraud or other risk.",
      ],
    },
    {
      heading: "7. Monthly purchases and standing orders",
      blocks: [
        "Monthly purchases are made by **standing order**.",
        `You are responsible for setting up the standing order with your bank using the payment details and unique customer reference provided by ${brand}.`,
        `A standing order is an instruction that you give to your bank. **${brand} does not initiate the standing-order payment on your behalf.**`,
        "The minimum monthly purchase is **£20**, unless we state otherwise.",
        "You may change the amount of your standing order, pause it or cancel it at any time by giving the appropriate instruction to your bank.",
        `Cancelling or changing your standing order will normally prevent future payments but will not automatically close your ${brand} account or remove an existing balance.`,
        "You are responsible for ensuring that your standing order is correctly configured and that sufficient funds are available in your bank account.",
        "We are not responsible for payments that fail because of insufficient funds, incorrect bank details, an incorrect customer reference or another issue outside our reasonable control.",
      ],
    },
    {
      heading: `8. Payments and your ${brand} balance`,
      blocks: [
        `Your ${brand} balance represents the value of qualifying purchases successfully received and credited to your account, less amounts used or allocated towards vouchers and subject to any pending, failed, reversed or otherwise invalid transactions.`,
        "A payment will not necessarily be available for voucher redemption immediately when you instruct your bank to make it. We may need to receive and process the payment before it is credited to your available balance.",
        `If a payment is subsequently reversed, returned, recalled or otherwise determined not to have been successfully received, we may reverse the corresponding credit to your ${brand} balance.`,
        "We maintain a transaction record for your account.",
        "You should check your balance and transaction history and notify us promptly if you believe there is an error.",
        "We may correct genuine technical, administrative or processing errors affecting your balance. Where reasonably practicable, we will notify you of material corrections.",
        "Your balance does not earn interest.",
        "Your balance is not a bank deposit, savings balance or credit balance.",
      ],
    },
    {
      heading: "9. Requesting and using vouchers",
      blocks: [
        "When you have sufficient available balance, you may request a voucher through the Service for a participating retailer.",
        "The voucher may be subject to:",
        {
          list: [
            "a specific denomination;",
            "an expiry date;",
            "restrictions on eligible goods or services;",
            "restrictions on where the voucher can be used;",
            "minimum or maximum transaction values;",
            "restrictions on combining vouchers;",
            "restrictions on refunds or exchanges; and",
            "other retailer-specific terms.",
          ],
        },
        "Once a voucher has been issued, we may be unable to cancel, exchange or replace it, particularly where the voucher has already been delivered to you or redeemed.",
        `Where a voucher has been issued incorrectly because of an error by ${brand}, we will take reasonable steps to correct the error, subject to the circumstances and any applicable rights.`,
      ],
    },
    {
      heading: "10. Participating retailers and retailer terms",
      blocks: [
        `Participating retailers are independent businesses and are not agents, employees or representatives of ${name} unless we expressly state otherwise.`,
        "A retailer is responsible for the goods or services it supplies to you.",
        "When you use a voucher with a retailer, you may also be entering into a separate contract with that retailer. The retailer's own terms will apply to that purchase.",
        "Those terms may govern matters including:",
        {
          list: [
            "delivery;",
            "returns;",
            "refunds;",
            "exchanges;",
            "warranties;",
            "product availability;",
            "voucher expiry;",
            "permitted products and services; and",
            "circumstances in which the retailer may refuse a voucher.",
          ],
        },
        "We do not guarantee that a particular retailer will remain available through the Service.",
        "Retailers, brands, voucher denominations and other features may change from time to time.",
        `Nothing in these Terms removes or restricts any legal rights you have against a retailer or ${brand}.`,
      ],
    },
    {
      heading: "11. Cancellation and refunds",
      blocks: [
        "You may stop making future monthly purchases at any time by cancelling or changing your standing order with your bank.",
        "Your right to obtain a refund will depend on the nature and timing of the relevant purchase, whether a voucher has been issued or used, these Terms and your statutory consumer rights.",
        "Where a statutory cancellation right applies, you may have a **14-day cancellation period**. The start and application of that period depend on the circumstances of the particular contract or purchase.",
        `${brand} also provides an additional refund period of up to **24 days from the relevant monthly purchase**, subject to the conditions in these Terms.`,
        "Where you request a refund before the relevant amount has been converted into or used as a voucher, we will normally refund the relevant amount to the original payment source, subject to applicable law and reasonable verification requirements.",
        `Where a voucher has already been issued or used, we may be unable to refund the amount represented by that voucher, except where required by law or where the relevant retailer or ${brand} permits a refund.`,
        "Nothing in this section affects your statutory rights.",
        `If you wish to request a refund, contact [${email}](mailto:${email}) with details of your account and the relevant payment or purchase.`,
      ],
    },
    {
      heading: "12. Closing your account and unused balances",
      blocks: [
        `You may request closure of your ${brand} account at any time by contacting [${email}](mailto:${email}).`,
        "Closing your account does not cancel or reverse payments that have already been successfully processed.",
        "If you have an unused balance when your account is closed, we will, subject to these Terms and applicable law, provide a mechanism for you to use that balance to obtain one or more vouchers from a participating retailer.",
        "Where reasonably practicable, you may select the participating retailer from the options available at the time.",
        "Voucher denominations and availability may mean that it is not always possible to issue a single voucher for exactly the full amount of your balance. Where possible, we may issue multiple vouchers to represent the available balance.",
        "If the available voucher denominations cannot exactly match your balance, we will explain the available options.",
        "We will not intentionally cause you to lose an unused balance solely because you close your account.",
        "Nothing in this section prevents a refund where you are legally entitled to one.",
      ],
    },
    {
      heading: "13. Acceptable use",
      blocks: [
        "You must use the Service lawfully and responsibly.",
        "You must not use the Service:",
        {
          list: [
            "for fraud or any other unlawful purpose;",
            "in connection with money laundering, terrorist financing or other financial crime;",
            "to obtain money, vouchers or benefits through deception or abuse;",
            "to access another person's account without authorisation;",
            "to interfere with or disrupt the Service;",
            "to introduce malware, malicious code or other harmful material;",
            "to circumvent technical, security or account restrictions;",
            "to impersonate another person;",
            "to provide false or misleading information; or",
            `in any way that could reasonably damage ${brand}, its systems, participating retailers or other users.`,
          ],
        },
        "We may suspend or restrict your account where we reasonably believe that you have breached these Terms, where necessary to protect the Service or its users, or where required or permitted by law.",
        "Where reasonably practicable and legally permitted, we will explain the reason for a suspension or restriction.",
      ],
    },
    {
      heading: "14. Suspension and termination",
      blocks: [
        "We may suspend, restrict or terminate your access to the Service if:",
        {
          list: [
            "you materially breach these Terms;",
            "we reasonably suspect fraud or unlawful activity;",
            "your use presents a security or operational risk;",
            "we are required to do so by law or a competent authority;",
            "continuing to provide the Service would expose us to legal or regulatory risk; or",
            "we permanently discontinue the Service.",
          ],
        },
        "Where appropriate and legally permitted, we will provide reasonable notice before terminating your account.",
        "If we terminate your account, we will deal with any unused balance in accordance with these Terms and applicable law.",
        "Termination does not affect rights or obligations that arose before termination.",
        "Any provisions that are intended by their nature to continue after termination will remain effective.",
      ],
    },
    {
      heading: "15. Changes to the Service",
      blocks: [
        "We may change, update, suspend or discontinue parts of the Service from time to time.",
        "Changes may be necessary to:",
        {
          list: [
            "improve functionality;",
            "introduce new features;",
            "remove obsolete features;",
            "improve security;",
            "respond to technical issues;",
            "respond to changes in retailer availability;",
            "comply with legal or regulatory requirements; or",
            `protect ${brand} and its users.`,
          ],
        },
        "We will not deliberately remove or materially reduce an accrued customer entitlement except where permitted or required by law or these Terms.",
        "If a material change substantially affects your rights or obligations, we will provide reasonable notice where practicable.",
      ],
    },
    {
      heading: "16. Changes to these Terms",
      blocks: [
        "We may update these Terms from time to time.",
        "We may make changes where necessary to reflect:",
        {
          list: [
            "changes to the Service;",
            "changes to participating retailers;",
            "changes in technology;",
            "changes in law or regulation;",
            "security requirements; or",
            "changes to how we operate the Service.",
          ],
        },
        `We will update the **"Last updated"** date at the beginning of these Terms when changes are made.`,
        "Where a change is material, we will provide reasonable notice where practicable.",
        "If you continue to use the Service after revised Terms take effect, you will be treated as having accepted the revised Terms, subject to any rights you have under applicable law.",
        "If you do not agree to a material change, you may stop using the Service and request closure of your account.",
      ],
    },
    {
      heading: "17. Intellectual property",
      blocks: [
        `The **${brand}** name and branding, including the ${brand} UK trademark registered under number **${trademarkNumber}**, are owned by ${name}.`,
        `Unless otherwise stated, intellectual property rights in the Service, including its software, website, application, design, text, graphics, logos and other content, belong to ${name} or our licensors.`,
        "We grant you a limited, non-exclusive, non-transferable right to use the Service for its intended purpose and in accordance with these Terms.",
        "You must not, except where permitted by law or with our prior written permission:",
        {
          list: [
            "copy or reproduce the Service or its content;",
            "modify or create derivative works from the Service;",
            "commercially exploit the Service;",
            "reverse engineer the Service or attempt to obtain its source code;",
            "remove proprietary notices; or",
            `use ${brand} branding in a way that suggests an unauthorised association or endorsement.`,
          ],
        },
        "All rights not expressly granted to you are reserved.",
        "Third-party trademarks and branding displayed through the Service remain the property of their respective owners.",
      ],
    },
    {
      heading: "18. Our responsibility to you",
      blocks: [
        "We will provide the Service with reasonable care and skill.",
        "We aim to keep the Service available and functioning properly, but we do not guarantee that it will always be available, uninterrupted, error-free or compatible with every device or software environment.",
        "We may temporarily suspend access where reasonably necessary for maintenance, security, upgrades or other operational reasons.",
        "To the fullest extent permitted by law, we are not responsible for losses caused by circumstances outside our reasonable control or by your failure to comply with these Terms.",
        "We are not responsible for the quality, safety, legality, availability or performance of goods or services supplied by participating retailers, except where applicable law provides otherwise.",
        "Nothing in these Terms excludes or limits liability that cannot legally be excluded or limited, including liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation.",
        "Nothing in these Terms affects your statutory consumer rights.",
      ],
    },
    {
      heading: "19. Events outside our reasonable control",
      blocks: [
        "We will not be responsible for delay or failure to perform an obligation where the delay or failure results from circumstances outside our reasonable control.",
        "Examples may include:",
        {
          list: [
            "failures of banking or payment networks;",
            "telecommunications or internet failures;",
            "significant cyber incidents;",
            "power failures;",
            "failures of third-party technology providers;",
            "retailer or voucher-provider system failures;",
            "government action or changes in law;",
            "natural disasters;",
            "fire, flood or other major incidents;",
            "industrial disputes; or",
            "other events that could not reasonably have been prevented or anticipated.",
          ],
        },
        "Where an event outside our reasonable control affects your account or balance, we will take reasonable steps to restore the affected Service or resolve the issue.",
        "Nothing in this section removes any obligation we have to deal appropriately with an unused customer balance or any other legal entitlement.",
      ],
    },
    {
      heading: "20. Complaints, general terms and third-party rights",
      blocks: [
        { subheading: "Complaints" },
        `If you are unhappy with the Service, please contact us at [${email}](mailto:${email}).`,
        "Please provide enough information for us to understand and investigate your complaint. We will aim to acknowledge and resolve complaints as promptly as reasonably practicable.",
        "Nothing in this section limits any right you may have to pursue a complaint or legal remedy through another route.",
        { subheading: "Privacy" },
        "Our collection and use of personal information is explained in our [Privacy Policy](/privacy).",
        { subheading: "Severability" },
        "If any provision of these Terms is found to be unlawful, invalid or unenforceable, that provision will be treated as modified or removed to the minimum extent necessary, and the remaining provisions will continue to apply.",
        { subheading: "Waiver" },
        "If we do not immediately enforce a provision of these Terms, this does not mean that we have waived our right to enforce it later.",
        { subheading: "Assignment" },
        `You may not transfer your ${brand} account or rights under these Terms to another person without our prior written consent.`,
        "We may transfer our rights and obligations under these Terms where reasonably necessary as part of a corporate transaction, restructuring or transfer of the Service, provided that this does not unlawfully reduce your rights.",
        { subheading: "Entire agreement" },
        `These Terms, together with any documents expressly incorporated into them, constitute the agreement between you and ${name} concerning your use of the Service, except where additional terms expressly apply.`,
        { subheading: "Third-party rights" },
        "Unless these Terms expressly state otherwise, a person who is not a party to these Terms has no right to enforce any provision of them under the Contracts (Rights of Third Parties) Act 1999.",
      ],
    },
    {
      heading: "21. Governing law and contact",
      blocks: [
        `These Terms and your use of the Service are governed by the laws of **${jurisdiction}**.`,
        "If you are a consumer, you will also benefit from any mandatory protections provided by the law of the country in which you live where those protections cannot legally be excluded.",
        `Subject to those mandatory consumer protections, the courts of ${jurisdiction} will have exclusive jurisdiction over disputes arising from or relating to these Terms or the Service.`,
        { subheading: "Contact us" },
        "If you have any questions about these Terms or the Service, or if you wish to make a complaint, please contact:",
        {
          lines: [
            `**${name}**`,
            `Company number: **${companyNumber}**`,
            `Registered office: **${registeredOffice}**`,
            `Email: [${email}](mailto:${email})`,
          ],
        },
        "We will aim to respond as promptly as reasonably practicable.",
      ],
    },
  ],
};
