/**
 * Portal + email/SMS copy from Fortuna_Full_Email_and_SMS_Sequence.pdf
 * (Review edition | 23 November 2026).
 */

export type StepLink = { label: string; href: string };

export type StepCopy = {
  emailSubject: string;
  /** Paragraphs for email HTML/text (no greeting — layout adds Hi FirstName). */
  emailParagraphs: string[];
  emailBullets?: string[];
  emailNote?: string;
  smsBody: string;
  portalHeadline: string;
  portalParagraphs: string[];
  portalBullets?: string[];
  portalNote?: string;
  links?: StepLink[];
};

import { DEFAULT_LINKS } from "./steps";

const STOP = " Reply STOP to opt out.";

export const STEP_COPY: Record<string, StepCopy> = {
  request_access: {
    emailSubject: "Your Fortuna access is ready",
    emailParagraphs: [
      "Thank you for registering with Fortuna. Your access has been approved, and you can now activate your Fortuna onboarding account.",
      "Use the secure invitation link to create your password and sign in. Your onboarding portal will show the steps to complete, the resources for each stage and your progress.",
      "Once your account is activated, you will receive the next step to begin onboarding.",
    ],
    smsBody: `Thank you for registering with Fortuna. Use the secure invitation link to create your password and sign in. Your onboarding portal will show the steps to complete.${STOP}`,
    portalHeadline: "Your Fortuna access is ready",
    portalParagraphs: [
      "Your access has been approved and your Fortuna onboarding account is active.",
      "Use this portal to complete each stage, open the resources for that stage, and track your progress.",
    ],
  },

  onboarding_payment: {
    emailSubject: "Let’s get you onboarded with Fortuna",
    emailParagraphs: [
      "Let’s get you onboarded, set up and confident using the EA software.",
      "Please complete the onboarding payment to begin. We’ll guide you through each stage of the process.",
      "You’ll have training resources to revisit and technical help to get started. Complete each stage in your Fortuna portal so the system can guide you to the next step.",
    ],
    emailBullets: [
      "VPS setup, with the signup link, instructional video and illustrated PDF guide provided together.",
      "Your setup questionnaire, so we can understand your account structure and identify the approved broker options available to you.",
      "Opening your broker demo account with the required MT5 settings.",
      "Choosing your EA, registering in the licence portal and applying for your demo licence.",
      "Completing your user agreement and installing the EA on your VPS.",
      "Learning to monitor your account using the MT5 mobile app.",
      "Four weeks of demo practice before completing your readiness checklist and receiving the live account instructions.",
    ],
    smsBody: `To complete your onboarding, please review the email sent to you.${STOP}`,
    portalHeadline: "Complete your onboarding payment",
    portalParagraphs: [
      "Pay the one-time AUD $2,750 onboarding fee to unlock setup. We’ll then guide you through VPS, questionnaire, broker demo, licence, agreement, installation and demo practice.",
      "You’ll have training resources and technical help at each stage. Complete each step in this portal so the next one unlocks automatically.",
    ],
  },

  questionnaire: {
    emailSubject: "Tell us about your account setup",
    emailParagraphs: [
      "Please complete your onboarding questionnaire using the link below.",
      "Your answers help us identify the approved broker options suited to your intended account structure and the identification and residency documents you can provide.",
      "We’ll ask whether you plan to open an individual or entity account, the type of entity and its country of incorporation where applicable, the ultimate beneficial owner or owners, your country of tax residency, and the countries associated with your passport and residency documents. We also ask you to confirm that you can provide evidence of your residential address.",
      "You only need to tell us what documents you have available. Provide any documents requested for verification directly to your broker.",
      "Once your answers have been reviewed, your available broker options will be emailed to you.",
    ],
    smsBody: `Please complete your onboarding questionnaire so we can identify your broker options.${STOP}`,
    portalHeadline: "Onboarding questionnaire",
    portalParagraphs: [
      "Complete this questionnaire so we can assist with identifying suitable approved broker options for your account setup. Broker acceptance depends on the broker’s own requirements.",
      "Provide country information and confirm document availability only. Your broker will collect any identification documents and address evidence directly. The legal name of your entity is not required here.",
      "Once your answers have been reviewed, your available broker options will be shared with you.",
    ],
  },

  vps_setup: {
    emailSubject: "Time to set up your VPS",
    emailParagraphs: [
      "Your next step is to set up your Virtual Private Server, or VPS. This is the Windows environment where MT5 and your EA will run.",
      "Use the ForexVPS signup link to register. The instructional video and PDF guide are available in your Fortuna portal so you can follow the setup from start to finish.",
      "Once you can successfully connect and see the Windows desktop, return to your Fortuna portal and select My VPS is set up. You can then continue to the onboarding questionnaire.",
      "If you get stuck anywhere, select I need help in your Fortuna portal.",
    ],
    emailBullets: [
      "Click the VPS link to register and establish your VPS and follow the video or PDF to complete your signup.",
      "Follow the guide to connect to your VPS using the access details supplied by ForexVPS.",
      "Confirm that you can open your VPS and see the Windows desktop.",
    ],
    smsBody: `Time to set up your VPS. Please check your email or the Fortuna Client Portal for the full instructions.${STOP}`,
    portalHeadline: "Time to set up your VPS",
    portalParagraphs: [
      "Set up your Virtual Private Server (VPS) — the Windows environment where MT5 and your EA will run.",
      "Watch the video below, use the ForexVPS signup link, then connect with the access details ForexVPS provides. When you can open the Windows desktop, confirm My VPS is set up.",
    ],
    portalBullets: [
      "Register and establish your VPS using the signup link.",
      "Follow the video (and PDF if provided) to complete signup and connection.",
      "Confirm you can open your VPS and see the Windows desktop.",
    ],
    links: [
      { label: "Sign up to ForexVPS", href: DEFAULT_LINKS.forexVps },
      { label: "Open VPS setup video", href: DEFAULT_LINKS.vpsVideo },
    ],
  },

  broker_demo: {
    emailSubject: "Open your MT5 demo account",
    emailParagraphs: [
      "You’re now ready to open a demo account with one of your approved brokers. This gives you an account to practise with while you learn the software.",
      "Choose a broker and use the signup link provided in your portal. It is very important that you use the signup link provided. This helps ensure your account is grouped under the correct broker server arrangements for EA operations.",
      "Follow your selected broker’s registration process, then open a demo trading account with the settings listed below.",
      "Keep the MT5 account number, password and exact demo server name supplied by your broker in a secure place. You will need these details when applying for your EA licence and connecting MT5.",
      "Before marking this step complete, check that the account is a demo account and the settings match. Return to your Fortuna portal and select My demo account is open.",
      "If you get stuck anywhere, select I need help in your Fortuna portal.",
    ],
    emailBullets: [
      "Account: Demo",
      "Platform: MetaTrader 5 (MT5)",
      "Leverage: 500:1, which may appear as 1:500",
      "Account currency: USD",
      "Demo balance: USD 100,000",
    ],
    smsBody: `Your next step is to open your MT5 demo account. Please refer to your email or log in to your Fortuna Client Portal for full details.${STOP}`,
    portalHeadline: "Open your MT5 demo account",
    portalParagraphs: [
      "Choose a broker from your approved options and use its signup link. It is important to use the link provided so your account is grouped correctly with the broker for EA operations.",
      "Keep your account number, password and exact demo server handy — you will need them for your EA licence and MT5 connection.",
    ],
    portalBullets: [
      "Account: Demo",
      "Platform: MetaTrader 5 (MT5)",
      "Leverage: 500:1 (may appear as 1:500)",
      "Account currency: USD",
      "Demo balance: USD 100,000",
    ],
  },

  user_agreement: {
    emailSubject: "Review and sign your Fortuna user agreement",
    emailParagraphs: [
      "Please review and sign your Fortuna user agreement using the link in your portal.",
      "Read the document carefully and complete the required signing fields. Keep a copy of the completed agreement for your records.",
      "Once signing is recorded in your Fortuna onboarding profile, the next step will become available. If you have signed and your portal still shows this step as incomplete, select I need help.",
    ],
    smsBody: `Please review and sign your user agreement to continue.${STOP}`,
    portalHeadline: "Review and sign your Fortuna user agreement",
    portalParagraphs: [
      "Read the document carefully and complete the required signing fields. Keep a copy of the completed agreement for your records.",
      "Once signing is recorded, the next step unlocks. If you have signed and this step still shows as incomplete, select I need help.",
    ],
  },

  licence_portal: {
    emailSubject: "Register in the Fortuna licence portal",
    emailParagraphs: [
      "With your VPS and broker demo account ready, you can create your profile in the Fortuna licence portal.",
      "Connect to your VPS and open a web browser inside the VPS, such as Google Chrome or Microsoft Edge. Paste the signup link into that browser’s address bar and press Enter.",
      "Follow the registration section of the EA Registration & Setup Guide to create your profile and complete any email verification requested.",
      "Using a Mac or Apple keyboard? Copy the link on your Mac with Command+C. To paste it inside the Windows VPS, use Control+V. The Windows VPS uses Windows keyboard shortcuts.",
      "Keep your licence portal login details secure. You will use this same profile to apply for additional licences later.",
      "When registration is complete, confirm it in your Fortuna onboarding portal. If you get stuck, select I need help.",
    ],
    smsBody: `Create your licence portal profile using the registration guide in your onboarding portal and PDF provided.${STOP}`,
    portalHeadline: "Register in the Fortuna licence portal",
    portalParagraphs: [
      "Connect to your VPS and open a web browser inside it (Microsoft Edge or Google Chrome). Paste the signup link into the address bar.",
      "If you are copying from a Mac, use Command+C on your Mac and Control+V inside the Windows VPS.",
      "Follow the registration section of the EA Registration & Setup Guide. Keep your licence portal login secure — you will reuse it for later licences.",
    ],
    links: [
      {
        label: "Register in the Fortuna licence portal",
        href: DEFAULT_LINKS.licencePortalSignup,
      },
      {
        label: "Licence portal sign-in",
        href: DEFAULT_LINKS.licencePortalSignin,
      },
    ],
  },

  demo_licence_apply: {
    emailSubject: "Choose your EA and apply for your demo licence",
    emailParagraphs: [
      "Before selecting your EA, review the EA information and comparison PDF. It explains the three EA options and provides a comparison to help you decide which one you want to use.",
      "Once you’ve made your selection, sign in to your existing Fortuna licence portal profile and follow the licence application section of the registration guide.",
      "Select your chosen EA and apply for a Demo licence. Use your broker’s demo MT5 account number and the exact demo server name. Check these details carefully against the information supplied by your broker.",
      "Your licence needs to correspond to the account on which the EA will run. Submit the application, then return to your onboarding portal and select I’ve submitted my demo EA licence application.",
      "If you get stuck, select I need help in your Fortuna portal.",
    ],
    smsBody: `Review the EA comparison guide and submit your demo licence application. Refer to your email and Fortuna Client Portal.${STOP}`,
    portalHeadline: "Choose your EA and apply for a demo licence",
    portalParagraphs: [
      "Review the EA comparison guide to choose the EA you want to use. Sign in to the licence portal and follow the licence application section of the setup guide.",
      "Select Demo and enter your broker’s demo MT5 account number and exact demo server name. Then confirm you’ve submitted the application here.",
    ],
    links: [
      {
        label: "Licence portal sign-in",
        href: DEFAULT_LINKS.licencePortalSignin,
      },
    ],
  },

  demo_licence_approved: {
    emailSubject: "Your demo licence application — what happens next",
    emailParagraphs: [
      "Your next step is to check for approval of your demo EA licence. Approval can take up to 24 hours.",
      "Sign in to the Fortuna licence portal to check the application status.",
      "Once the licence shows as approved, return to your Fortuna onboarding portal and select My demo EA licence is approved. The portal will then guide you to the next available step.",
      "If approval has not arrived after 24 hours, or you need assistance checking the status, select I need help in your Fortuna portal.",
    ],
    smsBody: `Check your demo licence status. Once approved, confirm it in your onboarding portal.${STOP}`,
    portalHeadline: "Confirm demo licence approval",
    portalParagraphs: [
      "Approval can take up to 24 hours. Sign in to the Fortuna licence portal to check status.",
      "When it shows as approved, select My demo EA licence is approved. If it has been more than 24 hours, select I need help.",
    ],
    links: [
      {
        label: "Check licence portal status",
        href: DEFAULT_LINKS.licencePortalSignin,
      },
    ],
  },

  demo_install: {
    emailSubject: "Install your EA on your demo account",
    emailParagraphs: [
      "Your approved demo licence and completed agreement allow you to continue with installing the EA on your VPS.",
      "Connect to your VPS and open the installation section of the Fortuna EA Registration & Setup Guide. Keep Algo Trading off during setup.",
      "Follow the illustrated steps to download the Fortuna Installer inside the VPS, run it and complete the setup. Check that the MT5 account number and server correspond to the demo account linked to your approved EA licence.",
      "Set up Equity Protect on your demo account using the separate Fortuna Equity Protect Guide so you can practise before a live account.",
      "Open the EA settings and select Inputs. Choose your Equity Protect method, enter your parameter, set the pause duration, then press OK. Reopen Inputs to verify, then press OK again.",
      "Set and verify your Equity Protect parameters before enabling Algo Trading on the demo account.",
      "Once the EA is running, return here and select My EA is running on my demo account. Your four-week demo practice period starts from this confirmation.",
    ],
    portalNote:
      "Set and verify your Equity Protect parameters before enabling Algo Trading on the demo account. Keep Algo Trading off during setup.",
    smsBody: `Set up your demo EA and Equity Protect using the guides in your Fortuna Client Portal. Check your parameters and press OK before enabling Algo Trading.${STOP}`,
    portalHeadline: "Install your EA on your demo account",
    portalParagraphs: [
      "Connect to your VPS and follow the installation section of the Fortuna EA Registration & Setup Guide. Keep Algo Trading off during setup.",
      "Practise Equity Protect on demo using the Equity Protect Guide before you move to a live account.",
      "When MT5 is connected and the EA is running, confirm below. Your four-week demo practice period starts from that confirmation.",
    ],
    portalBullets: [
      "Download and run the Fortuna Installer inside the VPS.",
      "Match MT5 account number and server to your approved demo licence.",
      "Configure Equity Protect (Inputs → OK → reopen to verify).",
      "Only then enable Algo Trading and confirm the EA is running.",
    ],
  },

  mt5_mobile: {
    emailSubject: "View your account activity using MT5 mobile",
    emailParagraphs: [
      "Now that your EA is running on your demo account, use the MT5 mobile app for most routine viewing of your account activity and trading history.",
      "Keep your use of MT5 on the VPS to the setup and checks you need to perform. Leave MT5 running on your VPS.",
      "Download MetaTrader 5 by MetaQuotes from the Apple App Store or Google Play, then follow the Fortuna MT5 Mobile Setup Guide.",
      "Spend the next four weeks getting familiar with the software and reviewing your account activity. If you get stuck, select I need help in your Fortuna portal.",
    ],
    emailBullets: [
      "Open the app, tap Settings and open the option to add an account.",
      "Search for your broker and choose the correct broker and exact demo server.",
      "Enter your MT5 account number and password, then sign in.",
      "Use History to review transactions and Trade to view open positions.",
    ],
    smsBody: `Use MT5 mobile for routine account monitoring. Find the mobile setup guide in your portal.${STOP}`,
    portalHeadline: "Monitor your demo with MT5 mobile",
    portalParagraphs: [
      "Use the MT5 mobile app for routine monitoring. Leave MT5 running on the VPS — frequent VPS interaction increases the chance of changing a setting that affects the EA.",
      "Follow the MT5 Mobile Setup Guide to connect to your broker’s demo server, view activity, and filter history by date.",
    ],
  },

  demo_readiness: {
    emailSubject: "Are you ready for the next step with Fortuna?",
    emailParagraphs: [
      "You’ve reached the end of your four-week demo practice period. When you feel ready, please complete the Demo Readiness Checklist in your Fortuna portal.",
      "The checklist confirms that you can use the software independently and know where to get software support before proceeding to live account setup.",
      "Select Confirm and continue, Keep practising or I need help.",
      "If you’d like more time, continue using your demo account and return to the checklist when you’re ready. All seven items and the 28-day practice period must be complete before the live account instructions become available.",
    ],
    smsBody: `Your four-week demo practice period has ended. Complete your readiness checklist when ready.${STOP}`,
    portalHeadline: "Demo readiness checklist",
    portalParagraphs: [
      "Confirm each item when you feel ready. Keep practising if you need more time. All seven items and the 28-day period must be complete before live setup unlocks.",
    ],
  },

  live_licence_apply: {
    emailSubject: "Your next step with Fortuna — Apply for a live EA licence",
    emailParagraphs: [
      "You’ve completed your demo practice and readiness checklist. When you’re ready to move to a live account, sign in to your broker’s secure client portal and open a live MT5 account with the settings below.",
      "Once your live MT5 account is open, sign in to the Fortuna licence portal using your existing login. Follow the licence application section of the guide, select Live, and enter your live MT5 account number and exact live server name.",
      "After submitting, return here and select I’ve submitted my live EA licence application. If you get stuck, select I need help.",
    ],
    emailBullets: [
      "Account currency: USD",
      "Leverage: 500:1",
      "Product: Select the product that matches your chosen EA from your broker’s available options.",
    ],
    smsBody: `When ready, follow the live MT5 account and additional licence instructions in your portal.${STOP}`,
    portalHeadline: "Open a live MT5 account and apply for a live licence",
    portalParagraphs: [
      "Sign in to your broker’s secure client portal and open a live MT5 account. Then apply for a Live licence in the Fortuna licence portal with your live account number and exact live server.",
    ],
    portalBullets: [
      "Account currency: USD",
      "Leverage: 500:1",
      "Product matching your chosen EA",
    ],
    links: [
      {
        label: "Licence portal sign-in",
        href: DEFAULT_LINKS.licencePortalSignin,
      },
    ],
  },

  live_install: {
    emailSubject: "Install your live EA and set up Equity Protect",
    emailParagraphs: [
      "Once your live EA licence shows as approved in the Fortuna licence portal, return to your Fortuna onboarding portal and select My live EA licence is approved to open the setup instructions.",
      "Install the EA: connect to your VPS and follow the installation section of the Fortuna EA Registration & Setup Guide. Check that MT5 is connected to the live account and server linked to your approved licence. Keep Algo Trading off during setup.",
      "Set up Equity Protect using the separate Fortuna Equity Protect Guide and videos on your live account.",
      "Once you’ve completed both tasks, select I’ve installed the EA on my live account and I’ve configured Equity Protect on my live account.",
    ],
    portalNote:
      "Important — Set and verify Equity Protect before enabling Algo Trading. Before you turn on Algo Trading on your live account, set your Equity Protect parameters, press OK, then reopen settings to verify them. Enabling Algo Trading activates the EA and allows it to place live trades automatically. You are responsible for your risk settings. If unsure, leave Algo Trading off and select I need help.",
    smsBody: `Once your live licence is approved, follow the installation and Equity Protect guides. Set parameters, press OK and verify before enabling Algo Trading.${STOP}`,
    portalHeadline: "Install your live EA and set up Equity Protect",
    portalParagraphs: [
      "Confirm live licence approval first, then install the EA and configure Equity Protect before enabling Algo Trading.",
    ],
  },

  live_activation: {
    emailSubject: "Confirm when your live EA is active",
    emailParagraphs: [
      "You’ve confirmed that the EA is installed and Equity Protect is configured on your live MT5 account.",
      "When you decide to begin live trading, check that MT5 is connected to the correct live account and verify your applied Equity Protect settings before enabling Algo Trading. Once you’ve enabled Algo Trading and confirmed the EA is active, return here and select My live EA is active.",
      "For routine monitoring, use the MT5 mobile app. Leave MT5 running on your VPS. If you need software support, select I need help.",
      "Software usage fees are billed monthly in arrears. After each month ends, Fortuna will issue an invoice for the previous month’s software usage fees.",
    ],
    smsBody: `Confirm in your portal when your live EA is active. Software usage is invoiced monthly in arrears.${STOP}`,
    portalHeadline: "Confirm when your live EA is active",
    portalParagraphs: [
      "Verify account and Equity Protect settings before enabling Algo Trading. When the EA is active, confirm below.",
      "Software usage fees are billed monthly in arrears after each month ends.",
    ],
  },

  onboarding_complete: {
    emailSubject: "Your Fortuna onboarding is complete",
    emailParagraphs: [
      "Thank you for confirming that your EA is active on your live MT5 account. Your Fortuna onboarding is now complete.",
      "For routine monitoring, use the MT5 mobile app. Leave MT5 running on your VPS. If you need software support, select I need help in your Fortuna portal.",
      "Your software usage fees are billed monthly in arrears. After each month ends, we’ll email you an invoice for that month’s usage fees.",
    ],
    smsBody: `Your onboarding is complete. Access your guides and software support in the portal.${STOP}`,
    portalHeadline: "Onboarding complete",
    portalParagraphs: [
      "Your Fortuna onboarding is complete. Use MT5 mobile for routine monitoring and leave MT5 running on the VPS.",
      "Monthly software usage invoices will appear here after each month ends.",
    ],
  },

  usage_billing: {
    emailSubject: "Fortuna software usage invoice",
    emailParagraphs: [
      "Your Fortuna software usage invoice will appear here when issued after month-end.",
      "If you have a question about an invoice, reply to the invoice email and include your invoice number.",
    ],
    smsBody: `Your software usage invoice details are available in your Fortuna portal when issued.${STOP}`,
    portalHeadline: "Monthly software usage",
    portalParagraphs: [
      "Invoices for software usage fees are issued after each month ends. View and pay them from Billing when available.",
    ],
  },
};

/** Fill readiness bullets from DEMO_READINESS_ITEMS at runtime in UI; email uses same list. */
STEP_COPY.demo_readiness.emailBullets = [
  "I can connect to my VPS and check that MT5 is connected to my demo account and that the EA is running.",
  "I know how to create additional demo accounts and open live accounts in my broker’s secure client portal.",
  "I know how to apply for an EA licence in the Fortuna client portal.",
  "I know how to download the EA Installer, run it on my VPS and complete the setup.",
  "I can use the MT5 mobile app to view open positions, review trading history and filter it by date.",
  "I know to use the mobile app for routine monitoring and leave MT5 running on the VPS.",
  "I know how to request software support through the Fortuna portal, and I understand that I’m responsible for operating my trading account.",
];

export function getStepCopy(stepKey: string): StepCopy | undefined {
  return STEP_COPY[stepKey];
}

export function smsBodyForStep(stepKey: string, portalUrl: string): string {
  const copy = getStepCopy(stepKey);
  const link = `${portalUrl.replace(/\/$/, "")}/dashboard/steps/${stepKey}`;
  if (!copy) {
    return `Fortuna: Your next step is ready. Open ${link}.${STOP}`;
  }
  const base = copy.smsBody.replace(STOP, "").trim();
  return `${base} ${link}.${STOP}`;
}
