import React, { useState } from 'react';
import { type Trade } from '../types';
import JournalModal from './JournalModal';
import { JournalIcon } from './icons';

interface TradeLogProps {
  trades: Trade[];
  onUpdateTrade: (trade: Trade) => void;
}

const TradeLog: React.FC<TradeLogProps> = ({ trades, onUpdateTrade }) => {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  const handleRowClick = (trade: Trade) => {
    setSelectedTrade(trade);
  };

  const handleCloseModal = () => {
    setSelectedTrade(null);
  };
  
  const handleSave = (updatedTrade: Trade) => {
    onUpdateTrade(updatedTrade);
    setSelectedTrade(null);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  }

  return (
    <>
      <div className="overflow-x-auto">
        <div className="min-w-full align-middle">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-500 sm:pl-0">Ticket</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-500">Symbol</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-500">Close Time</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-500">Profit</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-500">Journal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {trades.map((trade) => (
                <tr 
                  key={trade.ticket} 
                  className="hover:bg-slate-50 cursor-pointer"
                  onClick={() => handleRowClick(trade)}
                >
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-0">{trade.ticket}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{trade.symbol}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{formatDate(trade.closeTime)}</td>
                  <td className={`whitespace-nowrap px-3 py-4 text-sm font-semibold ${trade.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {trade.profit.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    {(trade.journal || trade.emotionBefore || trade.emotionAfter) && <JournalIcon />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedTrade && (
        <JournalModal 
          trade={selectedTrade}
          isOpen={!!selectedTrade}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default TradeLog;