import React, { useState, useCallback, useMemo, useEffect } from 'react';
import DataImporter from './components/DataImporter';
import Dashboard from './components/Dashboard';
import { type DashboardData, type Trade, type Account, type Goals } from './types';
import { processTrades, combineAccountData, calculateDashboardData } from './services/dataProcessor';
import { sampleCsvData } from './services/mockData';

const App: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // View state
  const [viewMode, setViewMode] = useState<'individual' | 'portfolio'>('individual');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  
  // Filtering state
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // Load accounts from localStorage on initial render
  useEffect(() => {
    try {
      const storedAccountsRaw = localStorage.getItem('tradePulseAccounts');
      if (storedAccountsRaw) {
        const parsedAccounts = JSON.parse(storedAccountsRaw);
        const rehydratedAccounts = parsedAccounts.map((account: Account) => ({
          ...account,
          data: {
            ...account.data,
            trades: account.data.trades.map((trade: any) => ({
              ...trade,
              openTime: new Date(trade.openTime),
              closeTime: new Date(trade.closeTime),
            })),
          },
        }));
        setAccounts(rehydratedAccounts);
        if (rehydratedAccounts.length > 0) {
            setSelectedAccountId(rehydratedAccounts[0].id);
        } else {
            setIsImporting(true);
        }
      } else {
        setIsImporting(true);
      }
    } catch (e) {
      console.error("Failed to load or parse accounts from localStorage", e);
      setAccounts([]);
      setIsImporting(true);
    }
  }, []);

  // Save accounts to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('tradePulseAccounts', JSON.stringify(accounts));
    } catch (e) {
      console.error("Failed to save accounts to localStorage", e);
    }
  }, [accounts]);

  const handleDataImport = useCallback((csvData: string, isSample = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = processTrades(csvData);
      const newAccount: Account = {
        id: `acc_${new Date().getTime()}`,
        name: `Account ${accounts.length + 1}${isSample ? ' (Sample)' : ''}`,
        data: data,
        goals: { totalProfit: 1000, winRate: 60, maxDrawdown: 10 },
      };
      const newAccounts = [...accounts, newAccount];
      setAccounts(newAccounts);
      setSelectedAccountId(newAccount.id);
      setViewMode('individual');
      setActiveTags([]); // Reset filters on new import
      setIsImporting(false);
    } catch (e) {
      if (e instanceof Error) {
        setError(`Failed to process data: ${e.message}. Please check the file format.`);
      } else {
        setError('An unknown error occurred during data processing.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [accounts]);
  
  const handleUseSampleData = useCallback(() => {
    handleDataImport(sampleCsvData, true);
  }, [handleDataImport]);

  const handleUpdateTradeDetails = useCallback((accountId: string, updatedTrade: Trade) => {
    setAccounts(prevAccounts => {
        return prevAccounts.map(account => {
            if (account.id === accountId) {
                const newTrades = account.data.trades.map(t => t.ticket === updatedTrade.ticket ? updatedTrade : t);
                // The dashboard data is now recalculated from the updated trades
                const updatedData = calculateDashboardData(newTrades);
                return { ...account, data: updatedData };
            }
            return account;
        });
    });
  }, []);
  
  const handleUpdateGoals = useCallback((accountId: string, newGoals: Goals) => {
    setAccounts(prevAccounts => {
        return prevAccounts.map(account => {
            if (account.id === accountId) {
                return { ...account, goals: newGoals };
            }
            return account;
        });
    });
  }, []);

  const baseData = useMemo(() => {
    if (viewMode === 'portfolio' && accounts.length >= 2) {
      return combineAccountData(accounts);
    }
    const activeAccount = accounts.find(acc => acc.id === selectedAccountId);
    return activeAccount ? activeAccount.data : null;
  }, [viewMode, accounts, selectedAccountId]);
  
  const uniqueTags = useMemo(() => {
    const allTrades = baseData?.trades.flatMap(t => t.tags || []) || [];
    // FIX: Corrected variable name from `allTags` to `allTrades`. This resolves both errors.
    return [...new Set(allTrades)];
  }, [baseData]);

  const filteredData = useMemo(() => {
    if (!baseData) return null;
    if (activeTags.length === 0) return baseData;

    const filteredTrades = baseData.trades.filter(trade => 
      activeTags.every(tag => trade.tags?.includes(tag))
    );

    // Recalculate all dashboard metrics based on the filtered trades
    return calculateDashboardData(filteredTrades);
  }, [baseData, activeTags]);

  const activeAccount = accounts.find(acc => acc.id === selectedAccountId);
  
  const renderContent = () => {
    if (accounts.length === 0 || isImporting) {
        return (
            <DataImporter 
              onImport={(csv) => handleDataImport(csv)}
              onCancel={() => setIsImporting(false)}
              isCancelVisible={accounts.length > 0}
              isLoading={isLoading}
              error={error}
              onSampleData={handleUseSampleData}
            />
        );
    }

    if (filteredData) {
        const accountIdForUpdate = viewMode === 'individual' ? selectedAccountId : null;
        return (
            <Dashboard 
                data={filteredData} 
                accounts={accounts}
                activeAccount={activeAccount}
                activeAccountId={selectedAccountId}
                viewMode={viewMode}
                onSetViewMode={setViewMode}
                onSetSelectedAccountId={setSelectedAccountId}
                onAddAccount={() => setIsImporting(true)}
                onUpdateTrade={(trade) => {
                    if(accountIdForUpdate) {
                       handleUpdateTradeDetails(accountIdForUpdate, trade);
                    }
                }}
                onUpdateGoals={(goals) => {
                    if(accountIdForUpdate) {
                       handleUpdateGoals(accountIdForUpdate, goals);
                    }
                }}
                isJournalingEnabled={viewMode === 'individual'}
                uniqueTags={uniqueTags}
                activeTags={activeTags}
                onSetActiveTags={setActiveTags}
            />
        );
    }

    return <div className="text-center p-10">Loading account data...</div>;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;