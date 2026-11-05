/**
 * Smoke-test Dropbox Sign non-embedded path (no CLIENT_ID).
 * Loads .env.local manually; does not create a live request unless RUN_LIVE=1.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
}

const apiKey = process.env.DROPBOX_SIGN_API_KEY;
const templateId = process.env.DROPBOX_SIGN_TEMPLATE_ID;
const clientId = process.env.DROPBOX_SIGN_CLIENT_ID;

console.log("DROPBOX_SIGN_API_KEY", apiKey ? "set" : "empty");
console.log("DROPBOX_SIGN_TEMPLATE_ID", templateId || "empty");
console.log(
  "DROPBOX_SIGN_CLIENT_ID",
  clientId ? "SET (embedded — leave empty for redirect E2E)" : "empty (redirect path OK)",
);
console.log("DROPBOX_SIGN_TEST_MODE", process.env.DROPBOX_SIGN_TEST_MODE);

if (!apiKey || !templateId) {
  console.error("Missing Dropbox env — cannot verify");
  process.exit(1);
}

if (clientId) {
  console.warn(
    "CLIENT_ID is set; app will use embedded create with null signUrl. Clear it for redirect E2E.",
  );
  process.exit(2);
}

if (process.env.RUN_LIVE !== "1") {
  console.log("Config OK for redirect signing. Set RUN_LIVE=1 to create a test request.");
  process.exit(0);
}

const { SignatureRequestApi, SignatureRequestSendWithTemplateRequest } =
  await import("@dropbox/sign");

const api = new SignatureRequestApi();
api.username = apiKey;
const sendData = new SignatureRequestSendWithTemplateRequest();
sendData.templateIds = [templateId];
sendData.subject = "Fortuna user agreement (E2E test)";
sendData.message = "Test signing request — discard if unused.";
sendData.signers = [
  {
    role: "Client",
    emailAddress: process.env.DROPBOX_TEST_EMAIL || "customer@fortuna.local",
    name: "E2E Test Client",
  },
];
sendData.metadata = { user_id: "e2e-test" };
sendData.testMode = process.env.DROPBOX_SIGN_TEST_MODE !== "false";

const result = await api.signatureRequestSendWithTemplate(sendData);
const sr = result.body.signatureRequest;
console.log("signatureRequestId", sr?.signatureRequestId);
console.log("signingUrl", sr?.signingUrl ? "present" : "missing");
process.exit(sr?.signingUrl ? 0 : 1);
