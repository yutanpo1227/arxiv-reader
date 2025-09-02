import axios from "axios";

export async function translateText(text: string, targetLang: string = "JA"): Promise<string> {
  try {
    // DeepL API URLと認証キー
    const apiUrl = "https://api-free.deepl.com/v2/translate";
    const authKey = process.env.DEEPL_AUTH_KEY;

    if (!authKey) {
      throw new Error("DEEPL_AUTH_KEY環境変数が設定されていません");
    }

    // DeepL APIにPOSTリクエスト
    const response = await axios.post(
      apiUrl,
      {
        text: [text],
        target_lang: targetLang,
        source_lang: "EN"  // オプション: 元の言語を指定
      },
      {
        headers: {
          "Authorization": `DeepL-Auth-Key ${authKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    // レスポンスの処理
    if (response.data && response.data.translations && response.data.translations.length > 0) {
      return response.data.translations[0].text;
    } else {
      throw new Error("翻訳結果が見つかりません");
    }
  } catch (error) {
    console.error("翻訳エラー:", error);
    throw error;
  }
}
