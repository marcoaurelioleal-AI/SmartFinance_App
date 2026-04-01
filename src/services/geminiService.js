// Esta função encapsula toda a lógica de comunicação com o Google Gemini.
// Fornecer o saldo e as transações reais como "Contexto" permite que a IA 
// dê conselhos personalizados em vez de dicas genéricas.
export const consultarIA = async (balance, transactions, userQuestion) => {
  // Verificação de segurança para evitar chamadas de API sem dados relevantes.
  if (transactions.length === 0 && balance === 0) {
    throw new Error('Adicione transações do dia a dia antes de consultar a Inteligência Artificial.');
  }

  const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY; 
  
  if (!GEMINI_API_KEY) {
    throw new Error('⚠️ Falha na Conexão.\nA chave de acesso não foi encontrada no .env. (Se acabou de criar, reinicie o app no terminal).');
  }

  // Serializamos os gastos em texto plano para que o LLM consiga processar 
  // os dados sem a necessidade de parsing complexo de JSON na requisição.
  const textoGastos = transactions
    .map(t => `${t.date}: ${t.category} (${t.description || 'S/N'}) - R$ ${t.value.toFixed(2)}`)
    .join('\n');

  // Prompt Engineering: Definimos um papel (Persona) e injetamos os dados vivos.
  // Isso garante que a IA não "alucine" gastos e se atenha ao balanço real do usuário.
  const prompt = `Você é o consultor do SmartFinance. O usuário tem R$ ${balance.toFixed(2)} e estas transações:
${textoGastos}

Responda à pergunta dele com base nesses dados reais: ${userQuestion || 'Pode analisar meus gastos e me dar algumas dicas?'}`;


  try {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await resp.json();

    if(data.error) {
      throw new Error(`⚠️ Falha na Conexão com a Inteligência Artificial.\nVá no arquivo .env e garanta que sua chave EXPO_PUBLIC_GEMINI_API_KEY está válida.`);
    } else {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return text || 'A IA não retornou conselhos dessa vez.';
    }
  } catch (err) {
    if (err.message.includes('⚠️') || err.message.includes('Adicione')) {
      throw err; // Re-throw known custom errors
    }
    throw new Error('Erro catastrófico ao conectar na API Google Gemini.');
  }
};
