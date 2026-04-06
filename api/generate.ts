import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { type, ...data } = req.body;

  try {
    if (type === 'menu') {
      const { dislikes, objective, additionalInfo } = data;
      const objectiveText = objective === "Fitness" 
        ? "Fitness (foco em proteínas, alimentos naturais e baixo açúcar)" 
        : "Apoio durante tratamento de câncer (alimentos leves, nutritivos e fáceis de consumir)";

      const prompt = `
        Você é um nutricionista especializado em dietas práticas e acessíveis. Crie um cardápio diário personalizado para um usuário com o seguinte perfil:
        - Alimentos que NÃO gosta ou tem restrição: ${dislikes || "Nenhum"}
        - Objetivo: ${objectiveText}
        - Observações/Informações do usuário: ${additionalInfo || "Nenhuma"}

        REGRAS OBRIGATÓRIAS:
        1. Use apenas ingredientes SUPER SIMPLES que qualquer pessoa encontra em qualquer supermercado.
        2. As receitas devem ser EXTREMAMENTE FÁCEIS e rápidas de fazer.
        3. Gere um cardápio com 4 refeições: Café da manhã, Almoço, Café da tarde e Jantar.
        4. Cada refeição deve ter um nome criativo, uma pequena descrição e uma sugestão simples de preparo.
        Responda estritamente em formato JSON.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              breakfast: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  preparation: { type: Type.STRING },
                },
                required: ["name", "description", "preparation"],
              },
              lunch: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  preparation: { type: Type.STRING },
                },
                required: ["name", "description", "preparation"],
              },
              afternoonSnack: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  preparation: { type: Type.STRING },
                },
                required: ["name", "description", "preparation"],
              },
              dinner: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  preparation: { type: Type.STRING },
                },
                required: ["name", "description", "preparation"],
              },
            },
            required: ["breakfast", "lunch", "afternoonSnack", "dinner"],
          },
        },
      });
      return res.status(200).json(JSON.parse(response.text || "{}"));
    }

    if (type === 'meal') {
      const { dislikes, objective, mealType, additionalInfo } = data;
      const objectiveText = objective === "Fitness" 
        ? "Fitness (foco em proteínas, alimentos naturais e baixo açúcar)" 
        : "Apoio durante tratamento de câncer (alimentos leves, nutritivos e fáceis de consumir)";

      const mealNames: any = {
        breakfast: "Café da manhã",
        lunch: "Almoço",
        afternoonSnack: "Café da tarde",
        dinner: "Jantar"
      };

      const prompt = `
        Você é um nutricionista especializado em dietas práticas e acessíveis. Crie uma opção de ${mealNames[mealType]} personalizada para um usuário com o seguinte perfil:
        - Alimentos que NÃO gosta ou tem restrição: ${dislikes || "Nenhum"}
        - Objetivo: ${objectiveText}
        - Observações/Informações do usuário: ${additionalInfo || "Nenhuma"}

        REGRAS OBRIGATÓRIAS:
        1. Use apenas ingredientes SUPER SIMPLES que qualquer pessoa encontra em qualquer supermercado.
        2. A receita deve ser EXTREMAMENTE FÁCIL e rápida de fazer.
        3. Gere apenas esta refeição com um nome criativo, uma pequena descrição e uma sugestão simples de preparo.
        Responda estritamente em formato JSON.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              preparation: { type: Type.STRING },
            },
            required: ["name", "description", "preparation"],
          },
        },
      });
      return res.status(200).json(JSON.parse(response.text || "{}"));
    }

    if (type === 'workout') {
      const { timeInMinutes, objective } = data;
      const prompt = `
        Você é um personal trainer especializado em treinos rápidos em casa. Crie um treino personalizado para um usuário com o seguinte perfil:
        - Tempo disponível: ${timeInMinutes} minutos
        - Objetivo: ${objective}

        REGRAS OBRIGATÓRIAS:
        1. O treino deve ser feito EM CASA, sem necessidade de equipamentos profissionais.
        2. Use exercícios simples e eficazes (ex: polichinelos, agachamentos, flexões, prancha).
        3. O tempo total do treino deve respeitar rigorosamente os ${timeInMinutes} minutos informados.
        4. Inclua uma lista de exercícios com o tempo ou repetições para cada um.
        5. Defina a intensidade do treino (Baixa, Média, Alta ou Muito Alta).
        Responda estritamente em formato JSON.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              duration: { type: Type.STRING },
              intensity: { type: Type.STRING },
              exercises: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["title", "description", "duration", "intensity", "exercises"],
          },
        },
      });
      return res.status(200).json(JSON.parse(response.text || "{}"));
    }

    return res.status(400).json({ error: 'Invalid type' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
