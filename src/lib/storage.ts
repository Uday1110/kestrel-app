import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface StorageAdapter {
  saveFile(fileBuffer: Buffer, fileName: string): Promise<{ storagePath: string; fileHash: string; fileSize: number }>;
  readFile(storagePath: string): Promise<Buffer>;
  deleteFile(storagePath: string): Promise<void>;
  fileExists(storagePath: string): Promise<boolean>;
}

export class LocalFileSystemStorageAdapter implements StorageAdapter {
  private baseDir: string;

  constructor(customPath?: string) {
    // Development storage directory outside public folder
    this.baseDir = customPath || path.join(process.cwd(), "storage", "documents");
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async saveFile(fileBuffer: Buffer, fileName: string): Promise<{ storagePath: string; fileHash: string; fileSize: number }> {
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    const sanitizedExt = path.extname(fileName) || ".pdf";
    const uniqueKey = `${Date.now()}_${hash.slice(0, 12)}${sanitizedExt}`;
    const destination = path.join(this.baseDir, uniqueKey);

    // Write file to private local disk
    await fs.promises.writeFile(destination, fileBuffer);

    return {
      storagePath: uniqueKey,
      fileHash: hash,
      fileSize: fileBuffer.length,
    };
  }

  async readFile(storagePath: string): Promise<Buffer> {
    // Prevent path traversal attacks
    const safePath = path.basename(storagePath);
    const fullPath = path.join(this.baseDir, safePath);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found in storage: ${safePath}`);
    }

    return await fs.promises.readFile(fullPath);
  }

  async deleteFile(storagePath: string): Promise<void> {
    const safePath = path.basename(storagePath);
    const fullPath = path.join(this.baseDir, safePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }

  async fileExists(storagePath: string): Promise<boolean> {
    const safePath = path.basename(storagePath);
    const fullPath = path.join(this.baseDir, safePath);
    return fs.existsSync(fullPath);
  }
}

// Global storage singleton instance
export const documentStorage: StorageAdapter = new LocalFileSystemStorageAdapter();
