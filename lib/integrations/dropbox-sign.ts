/**
 * Dropbox Sign (HelloSign) helpers.
 * Prefer per-client signature requests so webhooks match the client.
 */

export type SignatureRequestResult = {
  signatureRequestId: string | null;
  signUrl: string | null;
  error?: string;
};

export async function createUserAgreementRequest(options: {
  email: string;
  name: string;
  userId: string;
  clientId?: string;
}): Promise<SignatureRequestResult> {
  const apiKey = process.env.DROPBOX_SIGN_API_KEY;
  const templateId = process.env.DROPBOX_SIGN_TEMPLATE_ID;
  const testMode = process.env.DROPBOX_SIGN_TEST_MODE !== "false";

  if (!apiKey) {
    // Fallback: shared template link (cannot match webhooks reliably)
    return {
      signatureRequestId: null,
      signUrl: process.env.DROPBOX_SIGN_FALLBACK_URL ||
        "https://app.hellosign.com/s/CdRr7SgF",
      error: "DROPBOX_SIGN_API_KEY not configured — using fallback link",
    };
  }

  try {
    const { SignatureRequestApi, SignatureRequestCreateEmbeddedWithTemplateRequest } =
      await import("@dropbox/sign");

    const api = new SignatureRequestApi();
    api.username = apiKey;

    if (templateId && options.clientId) {
      const data: InstanceType<
        typeof SignatureRequestCreateEmbeddedWithTemplateRequest
      > = new SignatureRequestCreateEmbeddedWithTemplateRequest();
      data.clientId = options.clientId;
      data.templateIds = [templateId];
      data.subject = "Fortuna user agreement";
      data.message = "Please review and sign your Fortuna user agreement.";
      data.signers = [
        {
          role: "Client",
          emailAddress: options.email,
          name: options.name,
        },
      ];
      data.metadata = { user_id: options.userId };
      data.testMode = testMode;

      const result = await api.signatureRequestCreateEmbeddedWithTemplate(data);
      const sr = result.body.signatureRequest;
      const sig = sr?.signatures?.[0];
      return {
        signatureRequestId: sr?.signatureRequestId ?? null,
        signUrl: null,
        error: sig ? undefined : "No signature created",
      };
    }

    // Non-embedded template request
    const { SignatureRequestSendWithTemplateRequest } = await import(
      "@dropbox/sign"
    );
    if (!templateId) {
      return {
        signatureRequestId: null,
        signUrl:
          process.env.DROPBOX_SIGN_FALLBACK_URL ||
          "https://app.hellosign.com/s/CdRr7SgF",
        error: "DROPBOX_SIGN_TEMPLATE_ID not set",
      };
    }

    const sendData = new SignatureRequestSendWithTemplateRequest();
    sendData.templateIds = [templateId];
    sendData.subject = "Fortuna user agreement";
    sendData.message = "Please review and sign your Fortuna user agreement.";
    sendData.signers = [
      {
        role: "Client",
        emailAddress: options.email,
        name: options.name,
      },
    ];
    sendData.metadata = { user_id: options.userId };
    sendData.testMode = testMode;

    const result = await api.signatureRequestSendWithTemplate(sendData);
    const sr = result.body.signatureRequest;
    return {
      signatureRequestId: sr?.signatureRequestId ?? null,
      signUrl: sr?.signingUrl ?? null,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Dropbox Sign error";
    console.error("dropbox-sign", e);
    return {
      signatureRequestId: null,
      signUrl:
        process.env.DROPBOX_SIGN_FALLBACK_URL ||
        "https://app.hellosign.com/s/CdRr7SgF",
      error: message,
    };
  }
}
