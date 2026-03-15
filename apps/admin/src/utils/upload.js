import { getApiBase } from "./api";
import { getStoredAdminPassword } from "./admin-auth.js";

function shouldUseProxyUpload(keyPrefix) {
  return keyPrefix === 'cms/site-settings' || keyPrefix.startsWith('cms/site-settings/');
}

async function uploadFileViaProxy(file, { keyPrefix, adminPassword, base }) {
  const query = new URLSearchParams({
    filename: file.name,
    keyPrefix,
  });

  const response = await fetch(`${base}/api/upload/proxy?${query.toString()}`, {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'X-Admin-Password': adminPassword,
    },
    body: file,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      success: false,
      error: data.error || `Upload failed: ${response.status}`,
    };
  }

  return {
    success: true,
    url: data.viewUrl,
    key: data.key,
  };
}

export async function uploadFile(file, options = {}) {
  const { keyPrefix = 'uploads', adminPassword = getStoredAdminPassword() } = options;

  try {
    const base = getApiBase();
    if (shouldUseProxyUpload(keyPrefix)) {
      return await uploadFileViaProxy(file, { keyPrefix, adminPassword, base });
    }

    const signRes = await fetch(`${base}/api/upload/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Password': adminPassword,
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        contentLength: file.size,
        keyPrefix,
      }),
    });

    const signData = await signRes.json();
    if (!signRes.ok) {
      return {
        success: false,
        error: signData.error || `Failed to get upload URL: ${signRes.status}`,
      };
    }

    const { uploadUrl, key, viewUrl } = signData;
    let uploadRes;
    try {
      uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
      });
    } catch (_err) {
      return await uploadFileViaProxy(file, { keyPrefix, adminPassword, base });
    }

    if (!uploadRes.ok) {
      return await uploadFileViaProxy(file, { keyPrefix, adminPassword, base });
    }

    return { success: true, url: viewUrl, key };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown upload error',
    };
  }
}

export async function uploadFiles(files, options = {}) {
  const results = [];
  for (const file of files) {
    results.push(await uploadFile(file, options));
  }
  return results;
}

export async function checkStorageStatus() {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/api/upload/status`);
    return await res.json();
  } catch (_err) {
    return {
      provider: 'unknown',
      isReady: false,
      missingKeys: ['STORAGE_PROVIDER'],
    };
  }
}

export async function deleteUploadedFile(keyOrUrl, options = {}) {
  const { adminPassword = getStoredAdminPassword() } = options;

  try {
    if (typeof keyOrUrl === 'string' && keyOrUrl.startsWith('/assets/')) {
      return { success: true, skipped: true };
    }

    if (typeof keyOrUrl === 'string' && keyOrUrl.startsWith('http')) {
      try {
        const parsed = new URL(keyOrUrl);
        if (parsed.pathname.startsWith('/assets/')) {
          return { success: true, skipped: true };
        }
      } catch (_err) {
        // Continue with normal delete request if URL parsing fails.
      }
    }

    const base = getApiBase();
    const isUrl = typeof keyOrUrl === 'string' && keyOrUrl.startsWith('http');
    const res = await fetch(`${base}/api/upload/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Password': adminPassword,
      },
      body: JSON.stringify({
        key: isUrl ? null : keyOrUrl,
        url: isUrl ? keyOrUrl : null,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      return {
        success: false,
        error: error.error || `Delete failed: ${res.status}`,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown delete error',
    };
  }
}

export default {
  uploadFile,
  uploadFiles,
  checkStorageStatus,
  deleteUploadedFile,
};
