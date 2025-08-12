import { GoogleGenAI } from "@google/genai"

export class TranslationService {
  private ai: GoogleGenAI
  private model: string

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: __GENAI_API_KEY__ })
    this.model = "gemma-3-12b-it"
  }

  async translate(inputText: string): Promise<string> {
    const config = {}
    const contents = [
      {
        role: "user",
        parts: [
          {
            text:
              "Translate directly to french without explaining. take the best translation in your mind: " +
              inputText,
          },
        ],
      },
    ]

    try {
      const response = this.ai.models.generateContentStream({
        model: this.model,
        config,
        contents,
      })

      let translatedText = ""
      for await (const chunk of await response) {
        translatedText += chunk.text
      }

      return translatedText
    } catch (error) {
      console.error("Translation error:", error)
      throw new Error("Failed to translate text")
    }
  }
}

// Example usage:
// (Make sure to set the GEMINI_API_KEY environment variable before running this code)
// const service = new TranslationService(process.env.GEMINI_API_KEY!);
// service.translate('Hello, world!').then(console.log).catch(console.error);
