
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.API_KEY || '';
    // Não inicializa o AI aqui para evitar crash se a chave estiver vazia
  }

  private getClient(): GoogleGenAI | null {
    if (this.ai) return this.ai;

    if (!this.apiKey) {
      console.warn("Gemini API Key is missing");
      return null;
    }

    try {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
      return this.ai;
    } catch (e) {
      console.error("Failed to initialize Gemini Client", e);
      return null;
    }
  }

  async getSenseiAdvice(query: string, studentContext?: string) {
    const ai = this.getClient();
    if (!ai) return "O Sensei está tirando um cochilo (Chave de API não configurada).";

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Você é um Sensei Virtual de Jiu-Jitsu experiente (faixa preta 5º grau). 
        Sua missão é ajudar donos de academia e professores com gestão técnica e de alunos.
        Pergunta: ${query}
        Contexto do Aluno: ${studentContext || 'Geral'}
        Responda de forma motivadora, técnica e profissional.`,
        config: {
          temperature: 0.7,
        }
      });

      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Desculpe, tive um problema ao processar seu pedido. O tatame está um pouco cheio hoje!";
    }
  }

  async analyzeProgression(studentData: any) {
    const ai = this.getClient();
    if (!ai) return null;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Analise o seguinte aluno de Jiu-Jitsu para recomendação de grau ou faixa:
        ${JSON.stringify(studentData)}
        Forneça uma análise de pontos fortes e o que ele precisa melhorar para a próxima graduação.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvementPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              nextStep: { type: Type.STRING }
            }
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      return null;
    }
  }
}

export const geminiService = new GeminiService();
