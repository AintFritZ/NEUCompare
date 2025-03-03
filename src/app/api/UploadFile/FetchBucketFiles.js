import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing. Check your environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchBucketFiles() {
  try {
    // Fetch list of files in the "neu_curriculum" bucket
    const { data, error } = await supabase.storage.from("neu_curriculum").list();

    if (error) {
      console.error("Error fetching files:", error.message);
      return [];
    }

    // If no files are found
    if (!data || data.length === 0) {
      console.warn("No files found in bucket.");
      return [];
    }

    // Get public URLs for each file
    const filesWithUrls = data.map((file) => ({
      name: file.name,
      publicUrl: `${supabaseUrl}/storage/v1/object/public/neu_curriculum/${file.name}`,
    }));

    console.log("Fetched files:", filesWithUrls);
    return filesWithUrls;
  } catch (err) {
    console.error("Unexpected error while fetching files:", err);
    return [];
  }
}