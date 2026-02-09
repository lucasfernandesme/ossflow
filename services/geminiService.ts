
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async getSenseiAdvice(query: string, studentContext?: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Você é um Sensei Virtual de Jiu-Jitsu experiente (faixa preta 5º grau). 
        Sua missão é ajudar donos de academia e professores com gestão técnica e de alunos.
        Pergunta: ${query}
        Contexto do Aluno: ${studentContext || 'Geral'}
        Responda de forma motivadora, técnica e profissional.`,
        config: {
          temperature: 0.7,
          thinkingConfig: { thinkingBudget: 0 }
        }
      });

      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Desculpe, tive um problema ao processar seu pedido. O tatame está um pouco cheio hoje!";
    }
  }

  async analyzeProgression(studentData: any) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
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
