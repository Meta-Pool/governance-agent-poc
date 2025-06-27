'use client'
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { initWalletSelector, showWalletModal } from '@/utils/wallet';
import "@near-wallet-selector/modal-ui/styles.css";


type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const voteMap: Record<number, string> = {
  0: "For",
  1: "Against",
  2: "Abstain",
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello. How can I help you?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [votePayload, setVotePayload] = useState<{
    proposal_id: number;
    vote: number;
    [key: string]: any;
  } | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    let subscription: { unsubscribe: () => void };

    (async () => {
      const selector = await initWalletSelector();

      subscription = selector.store.observable.subscribe((state) => {
        const acc = state.accounts[0];
        setAccountId(acc?.accountId || null);
      });
    })();

    return () => {
      if (subscription) {
        subscription.unsubscribe(); // ✅ correcto
      }
    };
  }, []);



  const connect = async () => {
    await initWalletSelector();
    showWalletModal();
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      if (!accountId) {
        throw new Error("Please connect your wallet to chat with the agent.");
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, accountId })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to parse error response.' }));
        throw new Error(errorData.message || `Request failed with status ${res.status}`);
      }

      const data = await res.json();
      const assistantMessageContent = data.message;
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessageContent }]);

      const match = assistantMessageContent.match(/{[\s\S]*}/);

      if (match && match[0]) {
        try {
          const parsed = JSON.parse(match[0]);
          console.log('Parsed vote payload:', parsed);
          setVotePayload(parsed);
        } catch (parseError) {
          console.error("Failed to parse JSON from AI response:", parseError, "Content:", match[0]);
        }
      }
    } catch (error) {
      console.error("Error in sendMessage:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errorMessage}` }]);
    } finally {
      setLoading(false);
    }
  };

  const vote = async () => {
    if (!votePayload) return;

    const selector = await initWalletSelector();
    const wallet = await selector.wallet();
    const accounts = await wallet.getAccounts();
    const signerId = accounts[0]?.accountId;

    if (!signerId) {
      alert("Please connect a wallet.");
      return;
    }

    try {
      await wallet.signAndSendTransaction({
        signerId,
        receiverId: "vote.r-1748895584.testnet",
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: "vote",
              args: votePayload,
              gas: "30000000000000",
              deposit: "1250000000000000000000",
            },
          },
        ],
      });

      const voteLabel = voteMap[votePayload.vote];

      alert(`✅ Voted "${voteLabel}" on proposal #${votePayload.proposal_id}`);
      setVotePayload(null);
    } catch (err) {
      console.error("Voting failed:", err);
      alert("❌ Voting failed. Please check the console for details.");
    }
  };


  return (
    <main className="p-4 bg-[#232322] w-full h-screen grid grid-cols-2 justify-center gap-6 max-h-screen">
      <div className='rounded-xl border border-gray-300 p-4 flex-col h-fit'>
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-bold text-gray-300">Chat with Claude & NEAR MCP & HoS Contract</h1>

          {accountId ? (
            <span className="text-sm text-lime-400">✅ Connected: {accountId}</span>
          ) : (
            <button onClick={connect} className="px-3 py-1 bg-sky-600 text-white rounded-lg cursor-pointer">Connect Wallet</button>
          )}
        </div>

        <div className="space-y-2 mb-4 overflow-y-auto max-h-[500px]">
          {messages.map((msg, i) => (
            <div key={i} className={`text-${msg.role === 'user' ? 'right' : 'left'}`}>
              <div><strong>{msg.role === 'user' ? 'You' : 'Agent'}:</strong> <ReactMarkdown>{msg.content}</ReactMarkdown></div>
            </div>
          ))}
          {loading && <p className='text-lime-400'>Typing...</p>}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            placeholder="Type your message..."
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            className="flex-1 p-2 px-4 border rounded-lg"
          />
          <button onClick={sendMessage} className="p-1 px-4 rounded-lg bg-[#434342]">Send</button>
        </div>

        {votePayload && (
          <div className="mt-4 text-sm bg-gray-800 text-gray-100 p-4 rounded">
            <p><strong>Pending Vote:</strong></p>
            <button onClick={vote} className="mt-2 bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded">
              Confirm Vote via Wallet
            </button>
          </div>
        )}
      </div>

      <div className='max-w-lg flex flex-col gap-3 rounded-lg shadow h-fit'>
        <h3 className='text-xl font-semibold text-sky-200'>How does the AI Governance Agent work?</h3>

        <div className='text-gray-300 text-sm'>
          This application integrates Anthropic&apos;s Claude AI with the NEAR blockchain through a custom Multi-Contract Provider (MCP). It&apos;s designed to make decentralized governance more accessible and intuitive.

          <br /><br />

          <strong>Architecture Overview:</strong>
          <ul className="list-disc list-inside pl-4 mt-1 text-gray-400">
            <li><strong>Frontend:</strong> Built with Next.js and connected to a NEAR wallet using Wallet Selector (MyNearWallet).</li>
            <li><strong>AI Agent:</strong> Claude Sonnet model, connected via SDK and enriched through a Glama-hosted MCP.</li>
            <li><strong>Blockchain Access:</strong> The MCP queries NEAR smart contracts and feeds structured data to Claude at runtime.</li>
          </ul>

          <br />

          <strong>What the agent can do today:</strong>
          <ul className="list-disc list-inside pl-4 mt-1 text-gray-400">
            <li>List active proposals from the governance contract.</li>
            <li>Summarize proposal details, options, and voting status.</li>
            <li>Generate a valid JSON payload to vote on a proposal.</li>
            <li>Detect and suggest if quorum is reached or action is required.</li>
            <li>Explain NEAR-specific terms like staking, veNEAR, delegation, etc.</li>
            <li>Guide users through governance workflows in natural language.</li>
          </ul>

          <br />

          <strong>How it works:</strong>
          <ol className="list-decimal list-inside pl-4 mt-1 text-gray-400">
            <li>You type a question (e.g. “How do I vote on proposal #2?”).</li>
            <li>The message is routed through the MCP, which queries NEAR contracts and attaches the data.</li>
            <li>Claude uses that data to generate a contextual, intelligent response.</li>
            <li>If a structured payload is returned, the frontend detects it and lets you confirm the action with your wallet.</li>
          </ol>

          <br />

          <strong>Security model:</strong>
          <ul className="list-disc list-inside pl-4 mt-1 text-gray-400">
            <li>Claude has read-only access to smart contract data via the MCP.</li>
            <li>All transactions are signed by the user using their own NEAR wallet.</li>
            <li>No private keys are exposed or handled by the AI or backend.</li>
          </ul>

          <br />

          This agent is modular and extensible. While it currently supports testnet contracts for proposals and voting, it can be extended to handle:
          <ul className="list-disc list-inside pl-4 mt-1 text-gray-400">
            <li>Delegation workflows (e.g. stake, unstake, delegate to validators)</li>
            <li>Token-related actions (view balances, metadata, etc.)</li>
            <li>Governance simulations, summaries, and multi-language support</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
