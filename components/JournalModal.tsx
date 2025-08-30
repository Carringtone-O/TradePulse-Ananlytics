import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { type Trade } from '../types';
import { CloseIcon, EmotionConfidentIcon, EmotionHopefulIcon, EmotionNeutralIcon, EmotionAnxiousIcon, EmotionFearfulIcon, XCircleIcon, NewsIcon } from './icons';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Trade) => void;
  trade: Trade;
}

const emotions = [
    { name: 'Confident', icon: EmotionConfidentIcon, color: 'text-emerald-500', ring: 'ring-emerald-500', bg: 'bg-emerald-50' },
    { name: 'Hopeful', icon: EmotionHopefulIcon, color: 'text-sky-500', ring: 'ring-sky-500', bg: 'bg-sky-50' },
    { name: 'Neutral', icon: EmotionNeutralIcon, color: 'text-slate-500', ring: 'ring-slate-500', bg: 'bg-slate-100' },
    { name: 'Anxious', icon: EmotionAnxiousIcon, color: 'text-amber-500', ring: 'ring-amber-500', bg: 'bg-amber-50' },
    { name: 'Fearful', icon: EmotionFearfulIcon, color: 'text-rose-500', ring: 'ring-rose-500', bg: 'bg-rose-50' },
];

const EmotionSelector: React.FC<{ title: string; selected: string | undefined; onSelect: (emotion: string) => void }> = ({ title, selected, onSelect }) => (
    <div>
        <h4 className="text-md font-semibold text-slate-700 mb-3">{title}</h4>
        <div className="flex flex-wrap gap-3">
            {emotions.map(({ name, icon: Icon, color, ring, bg }) => (
                <button
                    key={name}
                    type="button"
                    onClick={() => onSelect(name)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg w-20 h-20 transition-all duration-200 border-2 ${selected === name ? `${ring} ${bg}` : 'border-transparent bg-slate-100 hover:bg-slate-200'}`}
                    aria-label={`Select emotion: ${name}`}
                    title={name}
                >
                    <Icon />
                    <span className={`mt-1 text-xs ${selected === name ? color : 'text-slate-500'}`}>{name}</span>
                </button>
            ))}
        </div>
    </div>
);

// Renders the AI news summary with support for clickable links and bold text.
const NewsDisplay = ({ content }: { content: string }) => {
    const renderLine = (line: string) => {
        // Regex to match markdown links or bold text, used to split the line into parts
        const tokenRegex = /(\[.+?\]\(.+?\))|(\*\*.+?\*\*)/g;
        const parts = line.split(tokenRegex).filter(Boolean);

        return parts.map((part, index) => {
            // Check if the part is a markdown link: [title](url)
            let match = /\[([^\]]+)\]\(([^)]+)\)/.exec(part);
            if (match) {
                const [, title, url] = match;
                return <a href={url} key={index} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">{title}</a>;
            }

            // Check if the part is bold text: **text**
            match = /\*\*(.+?)\*\*/.exec(part);
            if (match) {
                return <strong key={index}>{match[1]}</strong>;
            }
            
            // It's plain text
            return part;
        });
    };

    return (
        <div className="prose prose-sm max-w-none space-y-1 text-slate-600">
            {content.split('\n').map((line, i) => {
                if (line.trim() === '') return null; // Don't render empty lines
                
                const isListItem = line.trim().startsWith('* ') || line.trim().startsWith('- ');
                const lineContent = isListItem ? line.trim().substring(2) : line;

                return (
                    <div key={i} className={`flex ${isListItem ? 'ml-4' : ''}`}>
                        {isListItem && <span className="mr-2">•</span>}
                        <p className="flex-1">{renderLine(lineContent)}</p>
                    </div>
                );
            })}
        </div>
    );
};


const JournalModal: React.FC<JournalModalProps> = ({ isOpen, onClose, onSave, trade }) => {
  const [journal, setJournal] = useState(trade.journal || '');
  const [emotionBefore, setEmotionBefore] = useState(trade.emotionBefore);
  const [emotionAfter, setEmotionAfter] = useState(trade.emotionAfter);
  const [tags, setTags] = useState<string[]>(trade.tags || []);
  const [tagInput, setTagInput] = useState('');
  
  const [news, setNews] = useState(trade.newsAnalysis || '');
  const [isNewsLoading, setIsNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState('');


  useEffect(() => {
    setJournal(trade.journal || '');
    setEmotionBefore(trade.emotionBefore);
    setEmotionAfter(trade.emotionAfter);
    setTags(trade.tags || []);
    setNews(trade.newsAnalysis || '');
    setIsNewsLoading(false);
    setNewsError('');
  }, [trade]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ ...trade, journal, emotionBefore, emotionAfter, tags, newsAnalysis: news });
  };
  
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput) {
        e.preventDefault();
        const newTag = tagInput.trim().toLowerCase().replace(/ /g, '-');
        if (newTag && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
        }
        setTagInput('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleFetchNews = useCallback(async () => {
    setIsNewsLoading(true);
    setNewsError('');
    
    const tradeDate = trade.closeTime.toISOString().split('T')[0];
    const tradeOutcome = trade.profit >= 0 ? `a profitable trade of $${trade.profit.toFixed(2)}` : `a losing trade of $${trade.profit.toFixed(2)}`;
    const prompt = `As a financial analyst, analyze the market news for the symbol ${trade.symbol} on or around the date ${tradeDate}. Correlate the news with the outcome of my trade, which was ${tradeOutcome}.
Focus on significant events (macroeconomic, central bank, geopolitical) that could have plausibly influenced this result.
Provide a brief summary and explain how the news could have contributed to the trade's profit or loss. If sources are found, list them in markdown format.`;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] },
        });
        
        let newsText = response.text;
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if(groundingChunks && groundingChunks.length > 0) {
            newsText += "\n\n**Sources:**\n";
            groundingChunks.forEach((chunk: any) => {
                if (chunk.web && chunk.web.uri && chunk.web.title) {
                    newsText += `* [${chunk.web.title}](${chunk.web.uri})\n`;
                }
            });
        }
        
        setNews(newsText);

    } catch(e) {
        console.error("News analysis error:", e);
        setNewsError("Failed to fetch market news. The API may be unavailable or there might be a network issue.");
    } finally {
        setIsNewsLoading(false);
    }
  }, [trade]);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200">
            <header className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 flex-shrink-0">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Trade Journal: Ticket #{trade.ticket}</h3>
                    <p className="text-sm text-slate-500">Symbol: {trade.symbol} | Profit: <span className={trade.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}>${trade.profit.toFixed(2)}</span></p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-500"><CloseIcon /></button>
            </header>

            <main className="p-4 sm:p-6 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EmotionSelector title="Emotion Before Trade" selected={emotionBefore} onSelect={setEmotionBefore} />
                    <EmotionSelector title="Emotion After Trade" selected={emotionAfter} onSelect={setEmotionAfter} />
                </div>
                
                <div>
                    <label htmlFor="journal-notes" className="text-md font-semibold text-slate-700 mb-2 block">Journal Notes</label>
                    <textarea 
                        id="journal-notes"
                        rows={5} 
                        value={journal}
                        onChange={(e) => setJournal(e.target.value)}
                        className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                        placeholder="What was your thesis for this trade? What went well? What could be improved?"
                    />
                </div>

                <div>
                    <label htmlFor="tags-input" className="text-md font-semibold text-slate-700 mb-2 block">Tags</label>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        {tags.map(tag => (
                            <div key={tag} className="flex items-center bg-violet-100 text-violet-700 text-sm font-medium px-3 py-1 rounded-full">
                                {tag}
                                <button onClick={() => removeTag(tag)} className="ml-2 text-violet-400 hover:text-violet-600"><XCircleIcon /></button>
                            </div>
                        ))}
                    </div>
                    <input 
                        type="text" 
                        id="tags-input"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                        className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                        placeholder="Type a tag and press Enter..."
                    />
                </div>
                
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="text-md font-semibold text-slate-700 mb-3">AI News Correlation</h4>
                    {news ? (
                        <NewsDisplay content={news} />
                    ) : (
                        <div>
                            <button onClick={handleFetchNews} disabled={isNewsLoading || !!news} className="flex items-center text-sm font-semibold bg-violet-100 text-violet-700 px-3 py-2 rounded-md hover:bg-violet-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                <NewsIcon />
                                {isNewsLoading ? 'Fetching News...' : 'Get Market News'}
                            </button>
                            {newsError && <p className="mt-2 text-sm text-rose-600">{newsError}</p>}
                        </div>
                    )}
                </div>

            </main>

            <footer className="flex justify-end items-center p-4 bg-slate-50 border-t border-slate-200 flex-shrink-0 rounded-b-2xl">
                <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 mr-3">Cancel</button>
                <button onClick={handleSave} className="px-6 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700">Save</button>
            </footer>
        </div>
    </div>
  );
};

export default JournalModal;