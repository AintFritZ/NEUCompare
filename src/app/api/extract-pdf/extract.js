import { supabase } from "@/utils/supabase";
import { extract } from "pdf-extracter";

export async function GET(req) {
  try {
    const filePath = "your-bucket/your-file.pdf"; // Change this to your file's actual path

    // 🔹 Step 1: Get the file from Supabase Storage
    const { data, error } = await supabase.storage.from("your-bucket").download("your-file.pdf");

    if (error) {
      return Response.json({ error: "Error fetching file: " + error.message }, { status: 500 });
    }

    // 🔹 Step 2: Convert the file to a Buffer
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 🔹 Step 3: Extract text from PDF
    const extractedText = await extract(buffer);

    return Response.json({ text: extractedText });
  } catch (err) {
    return Response.json({ error: "Internal Server Error: " + err.message }, { status: 500 });
  }
}
