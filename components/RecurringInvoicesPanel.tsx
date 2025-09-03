import React from 'react';
import type { RecurringInvoice } from '../types';
import { CalendarDaysIcon, CurrencyDollarIcon } from './Icons';

interface RecurringInvoicesPanelProps {
    invoices: RecurringInvoice[];
    onApprove: (invoiceId: string) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export const RecurringInvoicesPanel: React.FC<RecurringInvoicesPanelProps> = ({ invoices, onApprove }) => {
    return (
        <div className="bg-gray-800 rounded-lg shadow-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
                 <CalendarDaysIcon className="w-6 h-6 text-purple-400" />
                 <h2 className="text-lg font-bold text-gray-100">Recurring Invoices</h2>
            </div>
            
            {invoices.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-sm text-gray-400">No recurring invoices scheduled yet.</p>
                    <p className="text-xs text-gray-500 mt-1">Try: "Set up a monthly invoice for..."</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {invoices.map(invoice => {
                         const total = invoice.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0) * 1.08;
                        return (
                        <div key={invoice.id} className={`p-3 rounded-lg transition-all duration-300 ${invoice.isDueForApproval ? 'bg-green-900/50 border border-green-700' : 'bg-gray-700/50'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-200">{invoice.customerName}</p>
                                    <p className="text-sm text-gray-300 font-mono">{formatCurrency(total)}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xs font-semibold capitalize ${invoice.isDueForApproval ? 'text-green-400' : 'text-purple-400'}`}>{invoice.recurrenceFrequency}</p>
                                    <p className="text-xs text-gray-400">Next: {formatDate(invoice.nextDueDate)}</p>
                                </div>
                            </div>
                             {invoice.isDueForApproval && (
                                <button
                                    onClick={() => onApprove(invoice.id)}
                                    className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-1.5 px-3 rounded-md transition-colors duration-200"
                                >
                                    Approve & Draft
                                </button>
                            )}
                        </div>
                    )})}
                </div>
            )}
        </div>
    );
};