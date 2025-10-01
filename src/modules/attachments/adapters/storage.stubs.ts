import type { ObjectStorage } from '../domain/ports';

export class LocalObjectStorage implements ObjectStorage {
  async getPresignedUploadUrl(input: {
    storageKey: string;
    contentType: string;
    contentLength: number;
    expiresSeconds?: number;
  }): Promise<{ url: string; headers: Record<string, string> }> {
    return {
      url: `http://storage.local/upload?key=${encodeURIComponent(input.storageKey)}`,
      headers: { 'x-content-type': input.contentType },
    };
  }
  async getPresignedDownloadUrl(input: {
    storageKey: string;
    expiresSeconds?: number;
    responseContentDisposition?: string;
  }): Promise<{ url: string }> {
    const disp = input.responseContentDisposition
      ? `&disposition=${encodeURIComponent(input.responseContentDisposition)}`
      : '';
    return {
      url: `http://storage.local/download?key=${encodeURIComponent(input.storageKey)}${disp}`,
    };
  }
  async headObject(
    _storageKey: string,
  ): Promise<{ contentLength: number; contentType?: string }> {
    return { contentLength: 1024 };
  }
  async deleteObject(_storageKey: string): Promise<void> {}
}

export class NoopAntiVirusScanner {
  async scanObject(
    _storageKey: string,
  ): Promise<{ clean: true } | { clean: false; virus: string }> {
    return { clean: true };
  }
}
export class SimpleMimeSniffer {
  async sniff(storageKey: string): Promise<string> {
    if (storageKey.match(/\.jpe?g$/i)) return 'image/jpeg';
    if (storageKey.match(/\.png$/i)) return 'image/png';
    if (storageKey.match(/\.pdf$/i)) return 'application/pdf';
    return 'application/octet-stream';
  }
}
export class NoopImageProcessor {
  async createThumbnails(
    _storageKey: string,
    _opts?: { sizes?: number[] },
  ): Promise<{ keys: string[] }> {
    return { keys: [] };
  }
}
