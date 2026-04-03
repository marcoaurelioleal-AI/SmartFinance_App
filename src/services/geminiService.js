/**
 * ⚠️ AVISO DE SEGURANÇA ⚠️
 * O uso de EXPO_PUBLIC_GEMINI_API_KEY expõe sua chave no código fonte do app (bundle JS).
 * Para apps em produção, utilize um Proxy Backend para ocultar a chave.
 */
export const consultarIA = async (balance, transactions, userQuestion) => {
  // Prevenção de chamadas vazias desnecessárias
  if (transactions.length === 0 && balance === 0) {
    throw new Error('Adicione transações do dia a dia antes de consultar a Inteligência Artificial.');
  }

  // Acessando a variável de ambiente do Expo (Client-side)
  const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY; 
  
  if (!GEMINI_API_KEY) {
    console.error('ERRO: EXPO_PUBLIC_GEMINI_API_KEY não encontrada no .env');
    throw new Error('Serviço indisponível no momento. Verifique as configurações da chave de API.');
  }

  // Serialização controlada para evitar prompts excessivamente longos ou malformados
  const textoGastos = transactions
    .slice(0, 50) // Limite de 50 transações para o prompt
    .map(t => `${t.date}: ${t.category} - R$ ${t.value.toFixed(2)}`)
    .join('\n');

  const prompt = `Você é o consultor do SmartFinance. O usuário tem R$ ${balance.toFixed(2)} e estas transações recentes:
${textoGastos}

Responda: ${userQuestion || 'Dê dicas fundamentadas nos meus gastos.'}`;

  try {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: prompt }] }],
        // Configuração de segurança de conteúdo (opcional mas recomendado)
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
        ]
      })
    });

    const data = await resp.json();

    if (resp.status !== 200 || data.error) {
      console.error('Erro API Gemini:', data.error);
      throw new Error('A Inteligência Artificial está ocupada. Tente novamente em instantes.');
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || 'Não consegui processar as dicas desta vez.';

  } catch (err) {
    // Log interno seguro, mensagem genérica para o usuário
    console.log('[GeminiService Error]:', err.message);
    
    if (err.message.includes('Adicione')) throw err;
    throw new Error('Falha na conexão com o consultor financeiro.');
  }
};
