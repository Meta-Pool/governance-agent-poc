'use client'
import { useState } from 'react';

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
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chat con Claude + NEAR MCP</h1>
      <div className="space-y-2 mb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`text-${msg.role === 'user' ? 'right' : 'left'}`}>
            <p><strong>{msg.role === 'user' ? 'Tú' : 'Claude'}:</strong> {msg.content}</p>
          </div>
        ))}
        {loading && <p>Claude está escribiendo...</p>}
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
    </main>
  );
}
