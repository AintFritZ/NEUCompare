import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Upload File
export async function uploadFile(file) {
  if (!file) return { error: "No file provided" };

  // Corrected string template to use backticks and quotes
  const fileName = `${Date.now()}_${file.name}`;

  console.log("Uploading file with name:", fileName); // Debug log

  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from("transferee_curriculum")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type, // Ensure correct MIME type
    });

  if (error) {
    console.error("Upload Error:", error);
    return { error };
  }

  // Retrieve public URL
  const { data: urlData } = await supabase.storage
    .from("transferee_curriculum")
    .getPublicUrl(fileName);

  // Store the file name in localStorage for deletion on refresh
  localStorage.setItem("uploadedFileName", fileName);

  console.log("File uploaded successfully, public URL:", urlData.publicUrl); // Debug log

  return { url: urlData.publicUrl, fileName };
}

// Delete File from Supabase
export async function deleteFile(fileName) {
  if (!fileName) return;

  console.log("Deleting file with name:", fileName); // Debug log

  const { data, error } = await supabase.storage
    .from("transferee_curriculum")
    .remove([fileName]);

  if (error) {
    console.error("File deletion failed:", error);
  } else {
    console.log("File deleted successfully:", data);
  }
}