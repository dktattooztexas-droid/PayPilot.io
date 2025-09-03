import React from 'react';
import type { TickerItem } from '../types';
import { ArrowUpIcon, ArrowDownIcon } from './Icons';

interface MarketTickerProps {
    items: TickerItem[];
}

const TickerItemView: React.FC<{ item: TickerItem }> = ({ item }) => {
    const isUp = item.change >= 0;
    const color = isUp ? 'text-green-400' : 'text-red-400';
    const Icon = isUp ? ArrowUpIcon : ArrowDownIcon;

    return (
        <div className="flex items-center gap-2 px-6">
            <span className="font-bold text-gray-300">{item.symbol}</span>
            <span className="font-mono text-gray-200">{item.price.toFixed(2)}</span>
            <div className={`flex items-center text-xs font-mono ${color}`}>
                <Icon className="w-3 h-3" />
                <span>{item.change.toFixed(2)}</span>
                <span className="ml-1">({item.changePercent.toFixed(2)}%)</span>
            </div>
        </div>
    );
};

export const MarketTicker: React.FC<MarketTickerProps> = ({ items }) => {
    if (!items.length) {
        return null;
    }

    return (
        <div className="bg-gray-900/80 backdrop-blur-sm border-y border-gray-700/50 w-full overflow-hidden whitespace-nowrap">
            <div className="flex items-center h-8 text-sm">
                <div className="ticker-track flex">
                    {items.map((item, index) => <TickerItemView key={`${item.symbol}-${index}`} item={item} />)}
                    {/* Duplicate for seamless scroll */}
                    {items.map((item, index) => <TickerItemView key={`dup-${item.symbol}-${index}`} item={item} />)}
                </div>
            </div>
        </div>
    );
};
