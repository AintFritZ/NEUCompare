"use client"; // Mark as client-side component

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGoogleLogin } from "@react-oauth/google";
import styles from "./page.module.css";
import { uploadFile, deleteFile } from "./api/UploadFile/UploadFile";
import { fetchBucketFiles } from "./api/UploadFile/FetchBucketFiles"; // Fetch files from Supabase

export default function Home() {
  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null); // Store uploaded file
  const [fileUrl, setFileUrl] = useState(""); // Uploaded file URL (left container)
  const [bucketFiles, setBucketFiles] = useState([]); // Files from Supabase bucket
  const [selectedFileUrl, setSelectedFileUrl] = useState(""); // Selected file URL (right container)

  // Fetch files from Supabase bucket on mount
  useEffect(() => {
    const storedFileName = localStorage.getItem("uploadedFileName");

    if (storedFileName) {
      (async () => {
        await deleteFile(storedFileName); // Delete old file if needed
        localStorage.removeItem("uploadedFileName"); // Clear stored file name
        setFileUrl(""); // Reset file URL
      })();
    }

    // Fetch files from "neu_curriculum" bucket
    const fetchFiles = async () => {
      const files = await fetchBucketFiles();
      console.log("Fetched bucket files:", files); // Debugging
      setBucketFiles(files); // Update state with fetched files
    };

    fetchFiles();
  }, []);

  const login = useGoogleLogin({
    onSuccess: (credentialResponse) => {
      console.log("Login Success:", credentialResponse);
    },
    onError: (error) => {
      console.log("Login Failed:", error);
    },
  });

  // Handle file upload
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      console.error("Only PDF files are allowed.");
      return;
    }

    setUploadedFile(file); // Store uploaded file

    try {
      const uploadResponse = await uploadFile(file); // Upload file
      if (uploadResponse.error) {
        console.error("File upload failed:", uploadResponse.error);
      } else {
        console.log("File uploaded successfully:", uploadResponse.url);
        setFileUrl(uploadResponse.url); // Show uploaded file in left container
      }
    } catch (error) {
      console.error("Unexpected error during file upload:", error);
    }
  };

  // Handle selection of file from dropdown
  const handleSelectFile = (event) => {
    setSelectedFileUrl(event.target.value); // Update selected file URL for iframe
  };

  return (
    <div className={styles.page}>
      {/* Background Image */}
      <div className={styles.background}>
        <Image src="/PastelBG.jpg" alt="Background" fill objectFit="cover" priority />
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <Image src="/NEULogo.png" alt="Neu Logo" width={50} height={50} />
          <span className={styles.title}>NeuCompare</span>
        </div>
        <button className={styles.loginButton} onClick={login}>Login</button>
      </div>

      {/* Main Containers */}
      <div className={styles.container}>
        {/* Left Container: Uploaded file */}
        <div className={styles.fileContainer}>
          {!uploadedFile && (
            <button
              className={styles.uploadButton}
              onClick={() => fileInputRef.current.click()}
            >
              Upload File
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="application/pdf"
            onChange={handleFileChange}
          />

          {/* Display Uploaded File in Left Container */}
          {fileUrl && (
            <iframe src={fileUrl} className={styles.pdfViewer}></iframe>
          )}
        </div>

        {/* Right Container (File Selection + Viewer) */}
        <div className={styles.rightContainer}>
          {/* File Selection Bar (Only Above Right Container) */}
          <div className={styles.fileSelectBar}>
            <select
              className={styles.fileSelectDropdown}
              onChange={handleSelectFile}
              defaultValue=""
            >
              <option value="" disabled>Select a file</option>
              {bucketFiles.map((file) => (
                <option key={file.name} value={file.publicUrl}>
                  {file.name}
                </option>
              ))}
            </select>
          </div>

          {/* Display Selected File */}
          <div className={styles.fileContainer}>
            {selectedFileUrl && (
              <iframe src={selectedFileUrl} className={styles.pdfViewer}></iframe>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}