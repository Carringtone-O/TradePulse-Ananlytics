
import React, { useState, useRef } from 'react';
import { UploadIcon, MT4Icon, MT5Icon, MatchTraderIcon, TraderLockerIcon } from './icons';

interface DataImporterProps {
  onImport: (csvData: string) => void;
  onCancel: () => void;
  isCancelVisible: boolean;
  isLoading: boolean;
  error: string | null;
  onSampleData: () => void;
}

type ImportMethod = 'csv' | 'broker';
type Platform = 'mt4' | 'mt5' | 'match-trader' | 'trader-locker';

const platforms = [
    { id: 'mt4', name: 'MetaTrader 4', icon: <MT4Icon /> },
    { id: 'mt5', name: 'MetaTrader 5', icon: <MT5Icon /> },
    { id: 'match-trader', name: 'Match-Trader', icon: <MatchTraderIcon /> },
    { id: 'trader-locker', name: 'TraderLocker', icon: <TraderLockerIcon /> },
];

const DataImporter: React.FC<DataImporterProps> = ({ onImport, onCancel, isCancelVisible, isLoading, error, onSampleData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMethod, setImportMethod] = useState<ImportMethod>('csv');
  
  const [platform, setPlatform] = useState<Platform>('mt5');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [server, setServer] = useState('');
  const [brokerError, setBrokerError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onImport(text);
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        onImport(text);
      };
      reader.readAsText(file);
    }
  };
  
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };
  
  const handleConnectBroker = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setBrokerError(null);
    
    // Simulate API call to a backend
    setTimeout(() => {
        setIsConnecting(false);
        setBrokerError("Feature in Development: Automatic import requires a secure backend server to protect your credentials. This UI is ready for when that functionality is launched.");
    }, 2000);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-5xl text-center p-8 bg-white rounded-2xl shadow-lg relative border border-slate-200">
        {isCancelVisible && (
            <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
        )}
        <h2 className="text-3xl font-bold mb-2 text-slate-900">Add Trading Account</h2>
        <p className="text-slate-500 mb-8">Import your trade history to get started.</p>

        <div className="mb-8">
            <div className="inline-flex bg-slate-100 rounded-lg p-1 space-x-1">
                <button onClick={() => setImportMethod('csv')} className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${importMethod === 'csv' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>Upload CSV</button>
                <button onClick={() => setImportMethod('broker')} className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${importMethod === 'broker' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>Connect to Broker</button>
            </div>
        </div>
        
        {importMethod === 'csv' && (
            <div>
                 <div 
                  className="border-2 border-dashed border-slate-300 rounded-lg p-10 cursor-pointer hover:border-violet-500 hover:bg-slate-50 transition-all duration-300"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={openFileDialog}
                >
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <UploadIcon />
                    <p className="text-lg font-semibold text-slate-700">Drag & drop your CSV file here</p>
                    <p className="text-slate-500">or click to browse</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
                  </div>
                </div>
                
                <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-4 text-slate-400 text-sm">Or</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                </div>
                
                <div>
                    <button
                        onClick={onSampleData}
                        disabled={isLoading}
                        className="w-full max-w-sm mx-auto flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:bg-violet-400 disabled:cursor-not-allowed"
                    >
                        Use Sample Data
                    </button>
                </div>
                {error && <div className="mt-6 text-red-700 bg-red-100 p-3 rounded-md">{error}</div>}
            </div>
        )}

        {importMethod === 'broker' && (
            <div className="w-full max-w-md mx-auto text-left">
                <form onSubmit={handleConnectBroker} className="space-y-6">
                     <fieldset disabled={isConnecting}>
                        <div>
                            <label htmlFor="platform" className="block text-sm font-medium text-slate-700 mb-2">Platform</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {platforms.map(p => (
                                    <button key={p.id} type="button" onClick={() => setPlatform(p.id as Platform)} className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${platform === p.id ? 'border-violet-500 bg-violet-50' : 'border-slate-300 bg-white hover:bg-slate-50'}`}>
                                        {p.icon}
                                        <span className={`mt-2 text-xs font-semibold ${platform === p.id ? 'text-violet-700' : 'text-slate-500'}`}>{p.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="login" className="block text-sm font-medium text-slate-700 mb-2">Login ID</label>
                            <input type="text" id="login" value={login} onChange={e => setLogin(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm" />
                        </div>
                         <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">Investor Password</label>
                            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm" />
                        </div>
                         <div>
                            <label htmlFor="server" className="block text-sm font-medium text-slate-700 mb-2">Server</label>
                            <input type="text" id="server" value={server} onChange={e => setServer(e.target.value)} required className="appearance-none block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-violet-500 focus:border-violet-500 sm:text-sm" />
                        </div>
                     </fieldset>
                    <div>
                        <button type="submit" disabled={isConnecting || isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:bg-violet-400 disabled:cursor-not-allowed">
                            {isConnecting ? 'Connecting...' : 'Connect & Import'}
                        </button>
                    </div>
                </form>
                {brokerError && <div className="mt-6 text-amber-800 bg-amber-100 p-3 rounded-md text-sm">{brokerError}</div>}
            </div>
        )}
        
        {isLoading && <div className="mt-6 text-violet-600">Processing...</div>}
        {isCancelVisible && (
            <div className="mt-6">
                 <button onClick={onCancel} className="text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default DataImporter;