import React from 'react';
import { PayPalIcon, VenmoIcon, CashAppIcon, CheckCircleIcon } from './Icons';

interface AccountsPanelProps {
    connectedAccounts: string[];
    onConnect: (account: string) => void;
    onDisconnect: (account: string) => void;
}

const paymentProviders = [
    { id: 'PayPal', name: 'PayPal', Icon: PayPalIcon, color: 'text-blue-400' },
    { id: 'Venmo', name: 'Venmo', Icon: VenmoIcon, color: 'text-cyan-400' },
    { id: 'Cash App', name: 'Cash App', Icon: CashAppIcon, color: 'text-green-400' },
];

export const AccountsPanel: React.FC<AccountsPanelProps> = ({ connectedAccounts, onConnect, onDisconnect }) => {
    return (
        <div className="bg-gray-800 rounded-lg shadow-2xl p-6 border border-gray-700">
            <h2 className="text-lg font-bold text-gray-100 mb-4">Connected Accounts</h2>
            <div className="space-y-3">
                {paymentProviders.map(provider => {
                    const isConnected = connectedAccounts.includes(provider.id);
                    return (
                        <div key={provider.id} className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                                <provider.Icon className={`w-8 h-8 ${provider.color}`} />
                                <div>
                                    <p className="font-semibold text-gray-200">{provider.name}</p>
                                    {isConnected && (
                                        <div className="flex items-center gap-1 text-xs text-green-400">
                                            <CheckCircleIcon className="w-3.5 h-3.5" />
                                            <span>Connected</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => isConnected ? onDisconnect(provider.id) : onConnect(provider.id)}
                                className={`text-sm font-semibold py-1 px-3 rounded-full transition-colors duration-200 ${
                                    isConnected
                                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/40'
                                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/40'
                                }`}
                                aria-label={isConnected ? `Disconnect ${provider.name}` : `Connect ${provider.name}`}
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
