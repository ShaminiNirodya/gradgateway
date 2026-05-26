import { storage } from "@/lib/firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

export class StorageService {
  /**
   * Upload an image file to Firebase Storage
   * @param file The image file to upload
   * @param projectId The project ID for organizing storage
   * @returns Promise resolving to the download URL
   */
  static async uploadProjectImage(
    file: File,
    projectId: string
  ): Promise<string> {
    try {
      // Create a unique filename: projectId/timestamp-filename
      const timestamp = Date.now();
      const filename = `${projectId}/${timestamp}-${file.name}`;

      // Create a storage reference
      const storageRef = ref(storage, `project-images/${filename}`);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadUrl = await getDownloadURL(storageRef);

      return downloadUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image to Firebase Storage");
    }
  }

  /**
   * Delete an image from Firebase Storage by URL
   * @param imageUrl The download URL of the image to delete
   */
  static async deleteProjectImage(imageUrl: string): Promise<void> {
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
}
