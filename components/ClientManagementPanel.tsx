import React, { useState } from 'react';
import type { Client } from '../types';
import { User, UserPlusIcon, TrashIcon, DocumentTextIcon } from './Icons';

interface ClientManagementPanelProps {
    clients: Client[];
    onAddClient: (name: string) => void;
    onDeleteClient: (clientId: string) => void;
    onInvoiceClient: (clientName: string) => void;
}

export const ClientManagementPanel: React.FC<ClientManagementPanelProps> = ({ clients, onAddClient, onDeleteClient, onInvoiceClient }) => {
    const [newClientName, setNewClientName] = useState('');

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newClientName.trim()) {
            onAddClient(newClientName.trim());
            setNewClientName('');
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-2xl p-6 border border-gray-700 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
                 <User className="w-6 h-6 text-cyan-400" />
                 <h2 className="text-lg font-bold text-gray-100">Client Management</h2>
            </div>
            
            <div className="flex-1 space-y-2 mb-4 overflow-y-auto max-h-48 pr-2">
                {clients.length > 0 ? clients.map(client => (
                    <div key={client.id} className="flex items-center justify-between bg-gray-700/50 p-2 rounded-lg group">
                        <p className="font-medium text-gray-200 text-sm truncate">{client.name}</p>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => onInvoiceClient(client.name)}
                                title={`Invoice ${client.name}`}
                                className="p-1.5 text-blue-300 hover:bg-gray-600 rounded-md"
                                aria-label={`Create invoice for ${client.name}`}
                            >
                                <DocumentTextIcon className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => onDeleteClient(client.id)}
                                title={`Delete ${client.name}`}
                                className="p-1.5 text-red-400 hover:bg-gray-600 rounded-md"
                                aria-label={`Delete client ${client.name}`}
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )) : (
                    <p className="text-sm text-gray-400 text-center py-4">No clients yet. Create an invoice to add one automatically.</p>
                )}
            </div>

            <form onSubmit={handleAddSubmit} className="flex items-center gap-2 border-t border-gray-700 pt-4">
                <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Add new client name..."
                    className="flex-1 bg-gray-700 text-gray-200 placeholder-gray-400 border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    aria-label="New client name"
                />
                <button
                    type="submit"
                    disabled={!newClientName.trim()}
                    className="p-2 rounded-md bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    title="Add Client"
                    aria-label="Add new client"
                >
                    <UserPlusIcon className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};
