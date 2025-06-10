'use client'
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hola. ¿En qué puedo ayudarte?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input })
    });

    const data = await res.json();
    setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    setLoading(false);
  };

  return (
    <main className="p-4 bg-[#102a43] w-full h-screen grid grid-cols-2 justify-center gap-6 p-8">
      <div className='rounded-xl border border-gray-300 p-8 flex-col h-fit'>
        <h1 className="text-2xl font-bold mb-4 text-gray-300">Chat con Claude & NEAR MCP - Test</h1>
        <div className="space-y-2 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`text-${msg.role === 'user' ? 'right' : 'left'}`}>
              <div><strong>{msg.role === 'user' ? 'Tú' : 'Agent'}:</strong> <ReactMarkdown>{msg.content}</ReactMarkdown></div>
            </div>
          ))}
          {loading && <p className='text-lime-400'>Escribiendo...</p>}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            placeholder="Escribe tu mensaje..."
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            className="flex-1 p-2 border rounded"
          />
          <button onClick={sendMessage} className="p-2 border rounded">Enviar</button>
        </div>
      </div>
      <div className='max-w-lg flex flex-col gap-3 rounded-lg shadow h-fit'>
        <h3 className='text-xl font-semibold text-sky-200'>¿Cómo se integra la IA y el MCP?</h3>

        <div className='text-gray-300 text-sm'>
          <strong>Solicitud a Claude:</strong> Cuando envías un mensaje, la aplicación utiliza el SDK de Anthropic para comunicarse con Claude.
          <br /><br />
          <strong>Intervención del MCP de NEAR:</strong>
          <br />
          <strong>Punto Clave:</strong> La solicitud a Claude se configura para pasar primero por un servidor MCP específico de Glama AI en la red NEAR. Esto se logra especificando la <strong>URL</strong> del MCP, un <strong>nombre</strong> identificador y un <strong>token de autorización</strong>.
          <br /><br />
          Este MCP puede realizar acciones antes de que Claude procese tu mensaje, como:
          <ul className="list-disc list-inside pl-4 mt-1 text-gray-400">
            <li>Verificar credenciales en la blockchain.</li>
            <li>Registrar la interacción de forma descentralizada.</li>
            <li>Enriquecer la solicitud con datos provenientes de la red NEAR.</li>
          </ul>
          <br />
          <strong>Respuesta de Claude:</strong> Una vez que el MCP ha procesado la solicitud (si es necesario) y Claude ha generado una respuesta, esta se muestra en el chat.
        </div>
      </div>
    </main>
  );
}
