import React from 'react';
import type { Property } from '../types';
import { HomeIcon, SparklesIcon, TrashIcon, LoadingIcon } from './Icons';

interface PropertyWatchlistPanelProps {
    properties: Property[];
    onFindProperty: () => void;
    onDeleteProperty: (propertyId: string) => void;
    isLoading: boolean;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

const getTagColor = (type: Property['type']) => {
    switch (type) {
        case 'Foreclosure': return 'bg-red-500/20 text-red-300';
        case 'Below Market': return 'bg-green-500/20 text-green-300';
        case 'Rental Prospect': return 'bg-blue-500/20 text-blue-300';
        case 'Fixer-upper': return 'bg-yellow-500/20 text-yellow-300';
        default: return 'bg-gray-500/20 text-gray-300';
    }
}

export const PropertyWatchlistPanel: React.FC<PropertyWatchlistPanelProps> = ({ properties, onFindProperty, onDeleteProperty, isLoading }) => {
    return (
        <div className="bg-gray-800 rounded-lg shadow-2xl p-6 border border-gray-700 flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <HomeIcon className="w-6 h-6 text-yellow-400" />
                    <h2 className="text-lg font-bold text-gray-100">Property Watchlist</h2>
                </div>
                <button
                    onClick={onFindProperty}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 text-sm font-semibold py-1 px-3 rounded-full transition-colors duration-200 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Use AI to find a new property deal"
                >
                    {isLoading ? <LoadingIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
                    Find New Opportunity
                </button>
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto max-h-60 pr-2">
                {properties.length > 0 ? properties.map(prop => (
                    <div key={prop.id} className="bg-gray-700/50 p-3 rounded-lg group relative">
                        <div className="flex justify-between items-start">
                           <div>
                                <p className="font-semibold text-gray-200 text-sm">{prop.address}</p>
                                <p className="font-mono text-lg text-yellow-300">{formatCurrency(prop.price)}</p>
                           </div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getTagColor(prop.type)}`}>
                                {prop.type}
                            </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-2 flex justify-between items-center">
                            <span>{prop.beds} bed</span>
                            <span>{prop.baths} bath</span>
                            <span>{prop.sqft.toLocaleString()} sqft</span>
                        </div>
                         <div className="mt-2 pt-2 border-t border-gray-600/50">
                            <p className="text-xs text-gray-400 italic">"{prop.analysis}"</p>
                        </div>
                        <button 
                            onClick={() => onDeleteProperty(prop.id)}
                            title="Remove from watchlist"
                            className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Remove ${prop.address} from watchlist`}
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                )) : (
                    <div className="text-center py-10">
                         <p className="text-sm text-gray-400">Your property watchlist is empty.</p>
                         <p className="text-xs text-gray-500 mt-1">Click "Find New Opportunity" to start.</p>
                    </div>
                )}
            </div>
        </div>
    );
};