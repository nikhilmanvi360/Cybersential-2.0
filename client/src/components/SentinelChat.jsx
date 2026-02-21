import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiTerminal, FiCpu, FiShield } from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function SentinelChat({ token }) {
    const [messages, setMessages] = useState([
        { role: 'sentinel', text: 'SENTINEL-01 ONLINE. Awaiting directive, Analyst.', classification: 'PUBLIC-INIT' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsTyping(true);

        try {
            const res = await axios.post(`${API_URL}/api/ml/chat`, {
                message: userMsg
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessages(prev => [...prev, {
                role: 'sentinel',
                text: res.data.response,
                persona: res.data.persona,
                classification: res.data.classification
            }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'sentinel',
                text: 'ERROR: Intelligence link severed. Verify backend uplink.',
                classification: 'CRITICAL-ERR'
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="sentinel-panel h-full flex flex-col bg-sentinel-bg/80 backdrop-blur-md border border-sentinel-border rounded-lg overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-sentinel-border/30 px-3 py-2 flex items-center justify-between border-b border-sentinel-border">
                <div className="flex items-center gap-2">
                    <FiTerminal className="text-sentinel-cyan animate-pulse" />
                    <span className="text-[10px] font-mono text-sentinel-cyan tracking-[0.2em] font-bold">
                        SENTINEL-AI • INTELLIGENCE CORE
                    </span>
                </div>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-sentinel-cyan animate-ping" />
                    <div className="w-1.5 h-1.5 rounded-full bg-sentinel-cyan/50" />
                </div>
            </div>

            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-sentinel-cyan/20"
            >
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                        {msg.role === 'sentinel' && (
                            <div className="flex items-center gap-1 mb-1">
                                <span className="text-[8px] font-mono text-sentinel-cyan px-1 border border-sentinel-cyan/30 rounded bg-sentinel-cyan/5">
                                    {msg.classification || 'INTERNAL'}
                                </span>
                                <span className="text-[8px] font-mono text-sentinel-muted italic">
                                    [UPLINK: ACTIVE]
                                </span>
                            </div>
                        )}
                        <div className={`max-w-[85%] p-2 rounded text-xs font-mono leading-relaxed shadow-lg
                            ${msg.role === 'user'
                                ? 'bg-sentinel-cyan/10 border border-sentinel-cyan/30 text-sentinel-cyan rounded-tr-none'
                                : 'bg-sentinel-dark/60 border border-sentinel-border text-sentinel-text rounded-tl-none'
                            }
                        `}>
                            {msg.text}
                        </div>
                    </motion.div>
                ))}
                {isTyping && (
                    <div className="flex items-start">
                        <div className="bg-sentinel-dark/60 border border-sentinel-border text-sentinel-muted p-2 rounded rounded-tl-none text-[8px] font-mono animate-pulse">
                            ANALYZING QUERY...
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-sentinel-dark/40 border-t border-sentinel-border flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="ENTER COMMAND..."
                    className="flex-1 bg-sentinel-bg/50 border border-sentinel-border rounded px-3 py-1.5 text-xs font-mono text-sentinel-cyan placeholder:text-sentinel-muted focus:outline-none focus:border-sentinel-cyan/50 transition-colors"
                />
                <button
                    type="submit"
                    disabled={isTyping}
                    className="bg-sentinel-cyan/10 border border-sentinel-cyan/30 p-2 rounded text-sentinel-cyan hover:bg-sentinel-cyan/20 transition-all disabled:opacity-50"
                >
                    <FiSend size={14} />
                </button>
            </form>

            {/* Footer Status */}
            <div className="px-3 py-1 bg-sentinel-cyan/5 flex items-center gap-4 border-t border-sentinel-cyan/10">
                <div className="flex items-center gap-1">
                    <FiCpu className="text-sentinel-cyan size-2" />
                    <span className="text-[8px] font-mono text-sentinel-cyan/60">NEURAL LINK: 98%</span>
                </div>
                <div className="flex items-center gap-1">
                    <FiShield className="text-sentinel-cyan size-2" />
                    <span className="text-[8px] font-mono text-sentinel-cyan/60">ENCRYPTION: AES-256</span>
                </div>
            </div>
        </div>
    );
}
