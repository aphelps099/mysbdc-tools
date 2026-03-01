/**
 * Google Drive — upload pitch decks to a shared folder.
 *
 * Uses a service account for authentication. The service account's email
 * must be shared with (given Editor access to) the target Drive folder.
 *
 * Env vars:
 *   GOOGLE_SERVICE_ACCOUNT_KEY — base64-encoded JSON credentials
 *   GOOGLE_DRIVE_FOLDER_ID     — destination folder ID
 */

import { google } from 'googleapis';
import { Readable } from 'stream';

function getCredentials(): { email: string; key: string } | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;
  try {
    const json = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));
    return { email: json.client_email, key: json.private_key };
  } catch {
    console.warn('[google-drive] Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY');
    return null;
  }
}

function getFolderId(): string {
  return process.env.GOOGLE_DRIVE_FOLDER_ID || '';
}

/**
 * Upload a file to the configured Google Drive folder.
 * Returns the shareable webViewLink, or null if Drive is not configured.
 */
export async function uploadPitchDeck(
  fileName: string,
  buffer: Buffer,
  mimeType: string,
): Promise<{ fileId: string; webViewLink: string } | null> {
  const creds = getCredentials();
  const folderId = getFolderId();

  if (!creds || !folderId) {
    console.warn('[google-drive] Not configured — skipping pitch deck upload');
    return null;
  }

  const auth = new google.auth.JWT({
    email: creds.email,
    key: creds.key,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });

  // Upload the file
  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: 'id,webViewLink',
  });

  const fileId = res.data.id!;

  // Make the file viewable by anyone with the link
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  // Re-fetch to get the webViewLink (sometimes not returned on create)
  const file = await drive.files.get({
    fileId,
    fields: 'webViewLink',
  });

  return {
    fileId,
    webViewLink: file.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`,
  };
}
