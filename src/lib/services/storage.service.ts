import { storage } from "@/lib/firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

export class StorageService {
  /**
   * Upload a student profile picture to Firebase Storage
   * Folder: profile-pictures/
   * @param file The image file to upload
   * @param studentId The student ID for organizing storage
   * @returns Promise resolving to the download URL
   */
  private static readonly CV_ALLOWED_TYPES = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]);

  private static readonly CV_MAX_BYTES = 10 * 1024 * 1024;

  static validateCvFile(file: File): void {
    const lowerName = file.name.toLowerCase();
    const hasAllowedExtension =
      lowerName.endsWith(".pdf") ||
      lowerName.endsWith(".doc") ||
      lowerName.endsWith(".docx");

    if (
      !this.CV_ALLOWED_TYPES.has(file.type) &&
      !(file.type === "" && hasAllowedExtension)
    ) {
      throw new Error("CV must be a PDF or Word document (.pdf, .doc, .docx).");
    }

    if (file.size > this.CV_MAX_BYTES) {
      throw new Error("CV must be under 10MB.");
    }
  }

  /**
   * Upload a student CV to Firebase Storage (PDF or Word).
   */
  static async uploadStudentCv(file: File, firebaseUid: string): Promise<string> {
    try {
      this.validateCvFile(file);
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const filename = `${firebaseUid}/${timestamp}-${safeName}`;
      const storageRef = ref(storage, `student-cvs/${filename}`);

      await uploadBytes(storageRef, file, {
        contentType: file.type || "application/octet-stream",
      });
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading CV:", error);
      if (error instanceof Error) throw error;
      throw new Error("Failed to upload CV to Firebase Storage");
    }
  }

  private static readonly CHAT_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
  private static readonly CHAT_ATTACHMENT_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]);

  /** Upload a chat attachment (image, PDF, or Word doc) under the sender's uid. */
  static async uploadChatAttachment(file: File, firebaseUid: string): Promise<string> {
    if (!this.CHAT_ATTACHMENT_TYPES.has(file.type)) {
      throw new Error("Attachments must be an image (JPG, PNG, GIF, WebP), PDF, or Word document.");
    }
    if (file.size > this.CHAT_ATTACHMENT_MAX_BYTES) {
      throw new Error("Attachments must be under 10MB.");
    }

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const storageRef = ref(storage, `chat-attachments/${firebaseUid}/${timestamp}-${safeName}`);

    await uploadBytes(storageRef, file, {
      contentType: file.type || "application/octet-stream",
    });
    return await getDownloadURL(storageRef);
  }

  static async uploadProfilePicture(
    file: File,
    studentId: string
  ): Promise<string> {
    try {
      const timestamp = Date.now();
      const filename = `${studentId}/${timestamp}-${file.name}`;
      const storageRef = ref(storage, `profile-pictures/${filename}`);

      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      return downloadUrl;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw new Error("Failed to upload profile picture to Firebase Storage");
    }
  }

  /**
   * Upload a company logo to Firebase Storage
   * Folder: company-logos/
   * @param file The image file to upload
   * @param companyId The company ID for organizing storage
   * @returns Promise resolving to the download URL
   */
  static async uploadCompanyLogo(
    file: File,
    companyId: string
  ): Promise<string> {
    try {
      const timestamp = Date.now();
      const filename = `${companyId}/${timestamp}-${file.name}`;
      const storageRef = ref(storage, `company-logos/${filename}`);

      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      return downloadUrl;
    } catch (error) {
      console.error("Error uploading company logo:", error);
      throw new Error("Failed to upload company logo to Firebase Storage");
    }
  }

  /**
   * Upload a project image to Firebase Storage
   * Folder: project-images/
   * @param file The image file to upload
   * @param projectId The project ID for organizing storage
   * @returns Promise resolving to the download URL
   */
  static async uploadProjectImage(
    file: File,
    projectId: string
  ): Promise<string> {
    try {
      const timestamp = Date.now();
      const filename = `${projectId}/${timestamp}-${file.name}`;
      const storageRef = ref(storage, `project-images/${filename}`);

      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      return downloadUrl;
    } catch (error) {
      console.error("Error uploading project image:", error);
      throw new Error("Failed to upload project image to Firebase Storage");
    }
  }

  /**
   * Delete an image from Firebase Storage by URL
   * Works for all image types (profile pictures, company logos, project images)
   * @param imageUrl The download URL of the image to delete
   */
  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract the path from the download URL
      // Firebase download URLs have the format:
      // https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
      const urlParts = imageUrl.split("/o/");
      if (urlParts.length < 2) {
        console.warn("Invalid Firebase image URL format");
        return;
      }

      const encodedPath = urlParts[1].split("?")[0];
      const decodedPath = decodeURIComponent(encodedPath);

      const storageRef = ref(storage, decodedPath);
      await deleteObject(storageRef);
    } catch (error) {
      console.error("Error deleting image:", error);
      // Don't throw - deletion failure shouldn't break the app
    }
  }

  /**
   * Legacy method - kept for backward compatibility
   * @deprecated Use deleteImage instead
   */
  static async deleteProjectImage(imageUrl: string): Promise<void> {
    return this.deleteImage(imageUrl);
  }

  /**
   * Upload multiple project images
   * @param files Array of image files
   * @param projectId The project ID
   * @returns Promise resolving to array of download URLs
   */
  static async uploadProjectImages(
    files: File[],
    projectId: string
  ): Promise<string[]> {
    try {
      const uploadPromises = files.map((file) =>
        this.uploadProjectImage(file, projectId)
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("Error uploading multiple images:", error);
      throw new Error("Failed to upload one or more images");
    }
  }

  /**
   * Convert a File object to a data URL (base64)
   * Useful for preview before upload
   * @param file The file to convert
   * @returns Promise resolving to data URL string
   */
  static async fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
