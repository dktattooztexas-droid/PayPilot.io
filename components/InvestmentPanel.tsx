import React from 'react';
import type { InvestmentAccount } from '../types';
import { RobinhoodIcon, MetaMaskIcon, CheckCircleIcon } from './Icons';

interface InvestmentPanelProps {
    accounts: InvestmentAccount[];
    onConnect: (id: 'robinhood' | 'metamask') => void;
    onDisconnect: (id: 'robinhood' | 'metamask') => void;
}

const platforms = [
    { id: 'robinhood' as const, name: 'Robinhood', Icon: RobinhoodIcon, color: 'text-green-400' },
    { id: 'metamask' as const, name: 'MetaMask', Icon: MetaMaskIcon, color: 'text-orange-400' },
];

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export const InvestmentPanel: React.FC<InvestmentPanelProps> = ({ accounts, onConnect, onDisconnect }) => {
    return (
        <div className="bg-gray-800 rounded-lg shadow-2xl p-6 border border-gray-700">
            <h2 className="text-lg font-bold text-gray-100 mb-4">Investment Platforms</h2>
            <div className="space-y-3">
                {platforms.map(platform => {
                    const connectedAccount = accounts.find(acc => acc.id === platform.id);
                    const isConnected = !!connectedAccount;
                    
                    return (
                        <div key={platform.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                                <platform.Icon className={`w-8 h-8 ${platform.color}`} />
                                <div>
                                    <p className="font-semibold text-gray-200">{platform.name}</p>
                                    {isConnected && connectedAccount ? (
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <span className="text-green-400 flex items-center gap-1"><CheckCircleIcon className="w-3.5 h-3.5" /> Connected</span>
                                            <span className="text-gray-300 font-mono">{formatCurrency(connectedAccount.balance)}</span>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400">Not Connected</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => isConnected ? onDisconnect(platform.id) : onConnect(platform.id)}
                                className={`text-sm font-semibold py-1 px-3 rounded-full transition-colors duration-200 ${
                                    isConnected
                                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40'
                                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/40'
                                }`}
                                aria-label={isConnected ? `Disconnect ${platform.name}` : `Connect ${platform.name}`}
                            >
                                {isConnected ? 'Disconnect' : 'Connect'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
