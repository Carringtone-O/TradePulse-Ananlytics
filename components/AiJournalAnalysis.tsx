import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { type Trade } from '../types';

interface AiJournalAnalysisProps {
  trades: Trade[];
}

const AiJournalAnalysis: React.FC<AiJournalAnalysisProps> = ({ trades }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState('');

  const handleAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setAnalysis('');

    const journaledTrades = trades.filter(
      (trade) => trade.journal || trade.emotionBefore || trade.emotionAfter
    );

    if (journaledTrades.length < 3) {
      setError('Please add journal entries or emotions to at least 3 trades for a meaningful analysis.');
      setIsLoading(false);
      return;
    }

    const formattedJournalData = journaledTrades
      .map((trade, index) => {
        const parts = [
          `Trade #${index + 1}: Profit: $${trade.profit.toFixed(2)}`,
          trade.emotionBefore && `Emotion Before: ${trade.emotionBefore}`,
          trade.emotionAfter && `Emotion After: ${trade.emotionAfter}`,
          trade.journal && `Notes: "${trade.journal}"`,
        ];
        return parts.filter(Boolean).join(', ');
      })
      .join('\n');

    const prompt = `You are a trading psychologist. Analyze the following trading journal entries and emotional data. Identify recurring behavioral patterns, emotional triggers, and potential biases. Provide a concise, actionable summary in markdown format (using bullet points) to help the trader improve their mindset and decision-making. Focus on the relationship between emotions logged before/after trades and the trade's profit/loss.

Here is the data:
${formattedJournalData}`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setAnalysis(response.text);
    } catch (e) {
      console.error('Gemini API error:', e);
      setError('Failed to get analysis from AI. Please check your connection or API key setup.');
    } finally {
      setIsLoading(false);
    }
  }, [trades]);
  
  const hasJournalData = trades.some(t => t.journal || t.emotionBefore || t.emotionAfter);

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <button
          onClick={handleAnalysis}
          disabled={isLoading || !hasJournalData}
          className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          {isLoading ? 'Analyzing...' : 'Analyze My Journal'}
        </button>
        {!hasJournalData && <p className="text-sm text-slate-500">Add journal entries to enable AI analysis.</p>}
      </div>
      
      {error && <div className="mt-4 bg-rose-100 text-rose-700 p-3 rounded-lg text-sm">{error}</div>}
      
      {analysis && (
        <div className="mt-4 prose prose-sm max-w-none bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-600 flex-1">
           {analysis.split('\n').map((line, index) => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
                    return <li key={index} className="ml-4">{trimmedLine.substring(2)}</li>;
                }
                 if (trimmedLine.length > 0 && !trimmedLine.startsWith('#')) {
                    return <p key={index}>{line}</p>;
                 }
                return null;
           })}
        </div>
      )}
       {!analysis && !error && (
         <div className="flex-1 flex items-center justify-center">
             <p className="text-slate-400 text-center">Your AI-powered journal summary will appear here.</p>
         </div>
       )}
    </div>
  );
};

export default AiJournalAnalysis;