# Fortuna Global Holdings
## Developer handover — Client onboarding and monthly billing

**Scope.** Build the complete onboarding workflow in Phase 2. Include step tracking, automatic next-step notifications, reminders for incomplete steps, support escalation and admin visibility at launch. Monthly usage billing follows live activation. CRM, chat platforms and advanced analytics are separate from the core workflow.

**Review status.** Steps 1–11 consolidate the available decisions and use reconstructed client copy where the earlier wording was unavailable. Confirm the placement of the agreement and the initial delivery trigger for the EA comparison PDF before publishing. Steps 12–17 incorporate the latest revisions.

## Workflow and client communications

Use the client’s first name in emails, sign as **Fortuna Global Holdings**, and send clients to the applicable portal step with a direct link. Bracketed fields are implementation placeholders. The client sees only actions available at their current stage.

### 1. Request access and approve portal entry

**Build.** Keep the public Request Access form as initial registration for warm leads and referrals. Rename **Schedule** to **Contact Preferences**. Store submissions in the admin dashboard and notify the administrator. On approval, send an expiring, single-use invitation to activate the Fortuna onboarding account. Track submission, approval and activation separately.

**Client message — Your Fortuna access is ready**

Hi [First Name], your Fortuna access has been approved. Use the link below to activate your account and begin onboarding.

[Activate my Fortuna account]

### 2. Complete onboarding payment

**Build.** After registration is confirmed, send the Stripe link for the **one-time AUD $2,750 onboarding fee**. Advance on confirmed payment. Keep onboarding fees, any VPS subscription and recurring software usage invoices as separate records. Confirm the VPS billing arrangement before configuring a separate recurring charge.

**Client email — Let’s get you set up with Fortuna**

Hi [First Name], please complete the onboarding link below. We’ll guide you through setting up your account, installing the software and learning how to use it on a demo account. You’ll also have access to technical support to help you get started.

[Complete onboarding]

### 3. Complete the onboarding questionnaire

**Build.** Ask how the client will open the account, the entity type and country of incorporation where applicable, who the ultimate beneficial owner is, whether there is more than one and how many, and country of tax residency. Ask for passport issuing country and the countries for which residency documents are available. Ask whether the client can provide proof of residential address. Collect eligibility answers only. Omit legal entity name, residential address, document uploads and document numbers.

Use a Fortuna-maintained broker eligibility matrix. An AI assistant can interpret responses and explain the approved options. Route ambiguous or unmatched cases for review, and let the broker make its own eligibility decision. Support multiple approved broker choices.

**Client email — Complete your onboarding questionnaire**

Hi [First Name], please complete the questionnaire so we can identify the approved broker options available for your setup. We’ll ask about your account structure and the documents you can provide directly to your broker.

[Complete the questionnaire]

### 4. Set up the VPS

**Build.** Send the ForexVPS affiliate link and the video and PDF instructions in the same communication. Affiliate code **140887**. Record the client’s confirmation that the VPS is ready.

**Client email — Set up your VPS**

Hi [First Name], use the ForexVPS signup link below, then follow the video or PDF to set up and connect to your VPS. When it’s ready, select **My VPS is set up** in your Fortuna portal.

[Sign up to ForexVPS](https://www.forexvps.net/?aff=140887) · [VPS setup video] · [VPS setup PDF]

### 5. Open a broker demo account

**Build.** Show approved broker options with the correct referral link for each. Record the client’s selected broker and confirmation that the demo account is open.

**Client email — Open your MT5 demo account**

Hi [First Name], choose a broker from your approved options and use its signup link below. It’s important to use the link provided so your account is grouped correctly with the broker for EA operations.

[Broker name and referral link for each approved option]

Open a **demo** account on **MT5** with **USD** as the account currency, **500:1** leverage and a **USD 100,000** demo balance. Keep your account number and exact demo server handy. When your account is open, select **My demo account is open** in the Fortuna portal. If you get stuck, select **I need help**.

### 6. Register in the EA licence portal

**Build.** Check whether the licence portal supports account provisioning or SSO. Until verified, use the existing signup link for first-time users and an existing-account sign-in link for returning clients. Record client confirmation of registration.

**Client email — Create your Fortuna licence portal account**

Hi [First Name], connect to your VPS and open a web browser inside it, such as Microsoft Edge or Google Chrome. Paste the signup link into the address bar. If you’re copying from a Mac, use **Command+C** on your Mac and **Control+V** inside the Windows VPS.

[Register in the Fortuna licence portal](https://clients.fortunaglobalholdings.com/signup/19269b45c6374f4dae93fda3f32f7411)

[EA Registration & Setup Guide]

### 7. Choose an EA and submit the demo licence application

**Build.** Make the EA comparison PDF available before selection and link it from the selection instructions. Record the client’s submission as **Awaiting demo licence approval**.

**Client email — Choose your EA and apply for a demo licence**

Hi [First Name], review the EA comparison guide to choose the EA you want to use. Sign in to the licence portal and follow the licence application section of the setup guide. Select **Demo** and use the account number and exact demo server from your broker. Return to your Fortuna onboarding portal and select **I’ve submitted my demo EA licence application**.

[EA comparison PDF] · [EA Registration & Setup Guide] · [Licence portal sign-in]

### 8. Confirm demo licence approval

**Build.** Record approval as a client confirmation. After submission, show the waiting status and prompt clients to check the licence portal. Keep the demo installer locked until the applicable prerequisite steps are complete.

**Client notification.** Demo licence approval can take up to 24 hours. When it shows as approved in the licence portal, return here and select **My demo EA licence is approved**.

### 9. Sign the user agreement

**Build.** Use Dropbox Sign. The proposed placement is after demo licence approval and before demo installation, subject to final sequencing confirmation. Where supported, use a validated signing callback matched to the client’s signature request. Record completion and timestamp once, and unlock the next step. Confirm whether the existing template link supports reliable client matching or whether individual signature requests are required.

**Client email — Sign your Fortuna user agreement**

Hi [First Name], please review and sign your Fortuna user agreement to continue.

[Sign your agreement](https://app.hellosign.com/s/CdRr7SgF)

### 10. Install the EA on the demo account

**Build.** Display the installation guide after the prerequisites are complete. Record the client’s confirmation that the EA is running on the demo account. Start the demo timer from this timestamp.

**Client email — Install your EA on your demo account**

Hi [First Name], connect to your VPS and follow the installation section of the Fortuna EA Registration & Setup Guide. Check that MT5 is connected to the demo account and server linked to your approved licence. Once the EA is running on your demo account, return to your onboarding portal and confirm it.

[EA Registration & Setup Guide]

### 11. Practise on demo and monitor with MT5 mobile

**Build.** Display the mobile guide and demo practice status. Use the confirmation from Step 10 as the timer start.

**Client email — Monitor your demo account with MT5 mobile**

Hi [First Name], use the MT5 mobile app for routine monitoring of your demo account. The guide shows how to install the app, connect to your broker’s demo server, view account activity and filter trading history by date. Leave MT5 running on your VPS. Use the mobile app for routine checks to reduce the chance of accidentally changing a VPS setting that affects the EA.

[MT5 Mobile Setup Guide]

### 12. Complete the demo readiness checklist

**Build.** Send the readiness email after **28 days**. Unlock live account instructions only when all seven items are confirmed and the timer has elapsed. Record completion and timestamp. **Keep practising** and **I need help** leave live setup locked.

**Client email — Are you ready for the next step with Fortuna?**

Hi [First Name], please complete the Demo Readiness Checklist in your Fortuna portal. If you’d like more time, continue practising on your demo account and return when you’re ready. If you’re stuck, select **I need help**.

[Complete your Demo Readiness Checklist]

**Checklist**

- [ ] I can connect to my VPS and check that MT5 is connected to my demo account and that the EA is running.
- [ ] I know how to create additional demo accounts and open live accounts in my broker’s secure client portal.
- [ ] I know how to apply for an EA licence in the Fortuna client portal.
- [ ] I know how to download the EA Installer, run it on my VPS and complete the setup.
- [ ] I can use the MT5 mobile app to view open positions, review trading history and filter it by date.
- [ ] I know to use the mobile app for routine monitoring and leave MT5 running on the VPS.
- [ ] I know how to request software support through the Fortuna portal, and I understand that I’m responsible for operating my trading account.

**Actions** — Confirm and continue · Keep practising · I need help

### 13. Open a live MT5 account and apply for an additional EA licence

**Build.** Show the approved broker’s secure portal link, the account settings and the existing licence portal sign-in. Reuse the licence application section of the installation guide. Record the client’s submission and timestamp.

**Client email — Your next step with Fortuna — Apply for a live EA licence**

Hi [First Name], you’ve completed your demo practice and readiness checklist. When you’re ready, sign in to your broker’s secure client portal and open a **live MT5 account**. Select **USD**, **500:1 leverage** and the product that matches your chosen EA from your broker’s available options.

Sign in to the Fortuna licence portal using your existing login. Follow the same process you used for your demo licence. This time, select **Live** and enter your live MT5 account number and exact live server.

[Guide to applying for an additional EA licence] · [Apply for your live EA licence]

After submitting, return to your Fortuna onboarding portal and select **I’ve submitted my live EA licence application**. If you get stuck, select **I need help**.

### 14. Confirm approval, install the live EA and configure Equity Protect

**Build.** Set **Awaiting live licence approval** after Step 13. Unlock both guides when the client confirms approval. Display the bold notice immediately below the Equity Protect instructions in the email and portal. Record installation and Equity Protect configuration as separate timestamped confirmations. Unlock Step 15 after both.

**Client email — Install your live EA and set up Equity Protect**

Hi [First Name], once your live EA licence shows as approved in the Fortuna licence portal, return to your onboarding portal and select **My live EA licence is approved**.

1. Connect to your VPS and follow the installation section of the **Fortuna EA Registration & Setup Guide**. Check that MT5 is connected to the live account and server linked to your approved licence. Keep **Algo Trading** off during setup.
2. Follow the separate **Fortuna Equity Protect Guide** to configure Equity Protect on your live account.

**Important — Set and verify Equity Protect before enabling Algo Trading**

**Before you turn on Algo Trading in MT5 on your live account, set, save and verify your Equity Protect parameters. Enabling Algo Trading activates the EA and allows it to place live trades automatically as soon as its trading conditions are met.**

**You are in full control of your trading account. You are responsible for choosing, entering and checking your Equity Protect settings and for deciding when to enable Algo Trading. Fortuna provides software installation support. Choosing and managing your risk settings is your responsibility. If you’re unsure how to enter or verify your settings in MT5, leave Algo Trading off and select “I need help” for software support.**

When both tasks are complete, select **I’ve installed the EA on my live account** and **I’ve configured Equity Protect on my live account** in your Fortuna onboarding portal.

[EA Registration & Setup Guide] · [Equity Protect Guide]

### 15. Confirm live activation

**Build.** Record **My live EA is active** as a timestamped client confirmation. Show the billing notice in the email and when the client confirms activation.

**Client email — Confirm when your live EA is active**

Hi [First Name], you’ve confirmed that the EA is installed and Equity Protect is configured on your live MT5 account.

When you decide to begin live trading, verify the account and your saved Equity Protect settings before enabling **Algo Trading**. Once you’ve confirmed the EA is active, return to the onboarding portal and select **My live EA is active**.

Use the MT5 mobile app to monitor open positions and trading history. Leave MT5 running on your VPS. For software support, select **I need help**.

**Monthly software usage fees.** Software usage fees are billed monthly in arrears. After each month ends, Fortuna will issue an invoice for that month’s software usage fees.

**Portal notification.** Software usage fees are billed monthly in arrears. After each month ends, Fortuna will issue an invoice for that month’s software usage fees.

### 16. Complete onboarding

**Build.** Mark onboarding complete and send this email once when the client confirms live activation. Save the completion date.

**Client email — Your Fortuna onboarding is complete**

Hi [First Name], thank you for confirming that your EA is active on your live MT5 account. Your Fortuna onboarding is now complete.

For routine monitoring, use the MT5 mobile app to review open positions and trading history. Leave MT5 running on your VPS. If you need software support, select **I need help** in your Fortuna portal.

Your software usage fees are billed monthly in arrears. After each month ends, we’ll email you an invoice for that month’s usage fees.

### 17. Issue monthly usage invoices

**Build.** Issue invoices after month-end using the approved billing rules. Populate the email from the issued invoice record. Send once per invoice, including when the issuing event is retried. Use one delivery channel if the billing provider sends invoices. Show **Issued**, **Paid** and **Overdue** in admin and update from the billing provider where available.

**Client email — Fortuna software usage invoice | [Billing Month and Year]**

Hi [First Name], your Fortuna invoice for **[Billing Month and Year]** is ready. It covers software usage fees for **[Billing Period Start] to [Billing Period End]**.

- **Invoice number** — [Invoice Number]
- **Amount due** — [Amount] [Currency]
- **Payment due** — [Due Date]

[View invoice and payment instructions]

If you have a question about this invoice, reply to this email and include your invoice number.

## Build requirements across all steps

- Store each client’s current step, status, completion timestamps and how each milestone was confirmed. Distinguish client confirmations from validated Stripe or signing events.
- Enforce prerequisites on the server. Send one next-step message when a step unlocks. Deduplicate repeated events and repeated client clicks. Stop reminders when the step is complete and make reminder timing configurable.
- Track PDF opens and video viewing separately from client task completion. Broker account setup, VPS setup and licence approval are client-confirmed milestones.
- Keep **I need help** visible and pass the current step into the support request. An AI assistant can answer from approved guides and escalate exceptions. Keep passwords, identity documents and broker credentials out of support and onboarding records.
- Give administrators access to approvals, progress, content management and billing status. Restrict access by role and audit status changes.
- Verify the entire path before launch with a test client. Check failed and retried payment events, pending external steps, agreement matching, the 28-day gate, both live setup confirmations, one completion email and one email per invoice.

## PDF and video inventory

These review links identify the source PDFs. Upload client-accessible copies to the portal and use those links in the production communications.

| Resource | Used in |
| --- | --- |
| [Fortuna EA Registration & Setup Guide](https://chatgpt.com/library?file_id=libfile_28971570a1388191926e88a7c0882ab7&account_id=personal) | Steps 6, 7, 10, 13 and 14 |
| [Fortuna Complete Client Guide — EA information and comparison](https://chatgpt.com/library?file_id=libfile_37c149f4964081919b8d832a84c9a641&account_id=personal) | Before EA selection in Step 7 |
| [Fortuna MT5 Mobile Setup Guide](https://chatgpt.com/library?file_id=libfile_589c3b00a4f48191a275d418ee2f3938&account_id=personal) | Step 11 and routine monitoring |
| [Fortuna Equity Protect Guide](https://chatgpt.com/library?file_id=libfile_65056b4edf788191ad7afb0e4e6b4326&account_id=personal) | Step 14 as a separate PDF |
| VPS setup PDF and video | Step 4. Insert final client-ready files with the affiliate signup instructions. |

## Decisions and inputs needed before launch

- Confirm agreement placement and Dropbox Sign event matching. Confirm when the EA comparison PDF is first sent.
- Supply Stripe payment link, the final VPS files, approved broker and referral links, the broker eligibility matrix, broker-specific live product mapping and the licence portal sign-in URL. Confirm licence portal provisioning capabilities.
- Confirm where live account funding sits relative to installation and activation.
- Confirm the software usage fee calculation, payment due terms, first partial month treatment and invoice delivery system before enabling billing. Confirm any separate recurring VPS charge.
