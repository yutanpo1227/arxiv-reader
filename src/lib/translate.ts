import axios from "axios";

export async function translateText(text: string): Promise<string> {
  try {
    const url = `${process.env.TRANSLATE_API_URL!}?text=${encodeURIComponent(
      text
    )}`;
    const response = await axios.get(url);
    if (response.data.code === 200) {
      return response.data.text;
    } else {
      throw new Error(`Translation failed: ${response.data.text}`);
    }
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}
