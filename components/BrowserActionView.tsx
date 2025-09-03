import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon, SendIcon, XIcon, PayPalIcon, VenmoIcon, CashAppIcon } from './Icons';

interface PaymentLinkViewProps {
  paymentInfo: {
      message: string;
      link: string;
      method?: string;
  };
  onClose: () => void;
}

const getPaymentMethodUI = (method?: string) => {
    if (!method) {
        return { Icon: SendIcon, name: 'Payment Link', color: 'text-blue-400', buttonBg: 'bg-blue-600 hover:bg-blue-700' };
    }
    const lowerMethod = method.toLowerCase();
    if (lowerMethod.includes('paypal')) {
        return { Icon: PayPalIcon, name: 'PayPal Payment', color: 'text-blue-400', buttonBg: 'bg-blue-600 hover:bg-blue-700' };
    }
    if (lowerMethod.includes('venmo')) {
        return { Icon: VenmoIcon, name: 'Venmo Request', color: 'text-cyan-400', buttonBg: 'bg-cyan-600 hover:bg-cyan-700' };
    }
    if (lowerMethod.includes('cash')) {
        return { Icon: CashAppIcon, name: 'Cash App Request', color: 'text-green-400', buttonBg: 'bg-green-600 hover:bg-green-700' };
    }
    return { Icon: SendIcon, name: 'Payment Link', color: 'text-blue-400', buttonBg: 'bg-blue-600 hover:bg-blue-700' };
};


export const PaymentLinkView: React.FC<PaymentLinkViewProps> = ({ paymentInfo, onClose }) => {
    const [copied, setCopied] = useState(false);
    const { Icon, name, color, buttonBg } = getPaymentMethodUI(paymentInfo.method);

    const fullMessage = `${paymentInfo.message}\n\nYou can complete your payment here: ${paymentInfo.link}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(fullMessage);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 flex flex-col animate-fade-in">
            <div className="flex items-center justify-between bg-gray-700/80 px-4 py-2 rounded-t-lg border-b border-gray-600">
                <div className={`flex items-center gap-2 ${color}`}>
                    <Icon className="w-5 h-5" />
                    <h3 className="text-sm font-bold text-gray-200">{name}</h3>
                </div>
                 <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Close"
                    aria-label="Close payment link view"
                >
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="p-4 space-y-4">
                <p className="text-sm text-gray-300 bg-gray-900/50 p-3 rounded-md whitespace-pre-wrap">{paymentInfo.message}</p>
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-mono ${color} bg-black/50 p-2 rounded-md truncate flex-1`}>{paymentInfo.link}</span>
                </div>
            </div>
            <div className="p-3 bg-gray-800/80 rounded-b-lg border-t border-gray-700">
                 <button
                    onClick={handleCopy}
                    className={`w-full flex items-center justify-center gap-1.5 text-sm ${buttonBg} text-white font-semibold py-2 px-3 rounded-md transition-colors duration-200`}
                    title="Copy full message and link"
                    aria-label="Copy full message and link to clipboard"
                >
                    {copied ? <CheckIcon className="w-4 h-4 text-white" /> : <ClipboardIcon className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Message & Link'}
                </button>
            </div>
        </div>
    );
};