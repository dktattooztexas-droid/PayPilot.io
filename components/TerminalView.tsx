import React from 'react';
import { CurrencyDollarIcon, SendIcon, XIcon, PayPalIcon, VenmoIcon, CashAppIcon, CreditCardIcon } from './Icons';
import type { Invoice } from '../types';

interface InvoicePreviewProps {
  invoice: Invoice;
  onGenerateLink: (invoice: Invoice, total: number) => void;
  onChargeWithTerminal: (amount: number) => void;
  onClose: () => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

const PaymentMethodIndicator: React.FC<{method?: string}> = ({ method }) => {
    if (!method) return null;

    const lowerMethod = method.toLowerCase();
    let Icon = CurrencyDollarIcon;
    let text = method;
    let color = "text-gray-300";

    if (lowerMethod.includes('paypal')) {
        Icon = PayPalIcon;
        text = 'PayPal';
        color = "text-blue-400";
    } else if (lowerMethod.includes('venmo')) {
        Icon = VenmoIcon;
        text = 'Venmo';
        color = "text-cyan-400";
    } else if (lowerMethod.includes('cash')) {
        Icon = CashAppIcon;
        text = 'Cash App';
        color = "text-green-400";
    }

    return (
        <div className={`flex items-center gap-1.5 text-xs font-medium ${color}`}>
            <Icon className="w-4 h-4" />
            <span>{text}</span>
        </div>
    )
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, onGenerateLink, onChargeWithTerminal, onClose }) => {
    const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    // Assuming a flat 8% tax for demonstration purposes
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    return (
        <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 flex flex-col animate-fade-in">
            <div className="flex items-center justify-between bg-gray-700/80 px-4 py-2 rounded-t-lg border-b border-gray-600">
                <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
                    <h3 className="text-sm font-bold text-gray-200">Invoice Preview</h3>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Close Preview"
                    aria-label="Close invoice preview"
                >
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs text-gray-400">BILL TO</p>
                        <p className="font-semibold text-gray-100">{invoice.customerName}</p>
                    </div>
                    <PaymentMethodIndicator method={invoice.paymentMethod} />
                </div>
                <div className="border-t border-gray-700 pt-3">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-400">
                                <th className="font-medium pb-2">Description</th>
                                <th className="font-medium pb-2 text-center">Qty</th>
                                <th className="font-medium pb-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item, index) => (
                                <tr key={index} className="border-b border-gray-700/50">
                                    <td className="py-2">{item.description}</td>
                                    <td className="py-2 text-center">{item.quantity}</td>
                                    <td className="py-2 text-right font-mono">{formatCurrency(item.quantity * item.unitPrice)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-gray-300">
                        <span>Subtotal</span>
                        <span className="font-mono">{formatCurrency(subtotal)}</span>
                    </div>
                     <div className="flex justify-between text-gray-300">
                        <span>Tax (8.0%)</span>
                        <span className="font-mono">{formatCurrency(tax)}</span>
                    </div>
                     <div className="flex justify-between font-bold text-gray-100 text-base border-t border-gray-600 pt-2 mt-2">
                        <span>Total Due</span>
                        <span className="font-mono">{formatCurrency(total)}</span>
                    </div>
                </div>
                 {invoice.notes && (
                    <div className="text-xs text-gray-400 bg-gray-900/50 p-2 rounded-md">
                        <p className="font-semibold mb-1 text-gray-300">Notes:</p>
                        <p>{invoice.notes}</p>
                    </div>
                 )}
            </div>
            <div className="p-3 bg-gray-800/80 rounded-b-lg border-t border-gray-700 grid grid-cols-2 gap-2">
                <button
                    onClick={() => onGenerateLink(invoice, total)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-2 px-4 rounded-md hover:opacity-90 transition-opacity duration-200"
                >
                    <SendIcon className="w-4 h-4" />
                    Send Link
                </button>
                <button
                    onClick={() => onChargeWithTerminal(total)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:opacity-90 transition-opacity duration-200"
                >
                    <CreditCardIcon className="w-4 h-4" />
                    Charge Card
                </button>
            </div>
        </div>
    );
};