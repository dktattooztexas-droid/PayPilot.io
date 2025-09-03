import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { TerminalState } from '../types';
import { CreditCardIcon, ChipIcon, CheckCircleIcon, XIcon, LoadingIcon } from './Icons';

interface LiveTerminalViewProps {
    chargeAmount: number | null;
    onTransactionComplete: (success: boolean) => void;
}

const formatCurrency = (amount: number | null) => {
    if (amount === null) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// A simple Luhn algorithm check for card number validation (for simulation)
const isValidLuhn = (value: string) => {
    if (/[^0-9-\s]+/.test(value)) return false;
    let nCheck = 0, bEven = false;
    value = value.replace(/\D/g, "");
    for (var n = value.length - 1; n >= 0; n--) {
        var cDigit = value.charAt(n),
            nDigit = parseInt(cDigit, 10);
        if (bEven && (nDigit *= 2) > 9) nDigit -= 9;
        nCheck += nDigit;
        bEven = !bEven;
    }
    return (nCheck % 10) == 0;
};


export const LiveTerminalView: React.FC<LiveTerminalViewProps> = ({ chargeAmount, onTransactionComplete }) => {
    const [status, setStatus] = useState<TerminalState>('idle');
    const [cardData, setCardData] = useState({ 
        name: '',
        number: '', 
        expiry: '', 
        cvc: '', 
        address: '',
        city: '',
        zip: '' 
    });
    const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
    const [verificationResults, setVerificationResults] = useState({ avs: false, cvv: false });

    useEffect(() => {
        if (chargeAmount !== null && status === 'idle') {
            setStatus('awaiting_input');
        } else if (chargeAmount === null && status !== 'idle') {
            setStatus('idle');
            setCardData({ name: '', number: '', expiry: '', cvc: '', address: '', city: '', zip: '' });
            setErrors({});
            setVerificationResults({avs: false, cvv: false});
        }
    }, [chargeAmount, status]);

    const validateField = useCallback((name: string, value: string): string | undefined => {
        switch (name) {
            case 'name':
                return !value.trim() ? 'Name is required.' : undefined;
            case 'number':
                const rawCardNumber = value.replace(/\s/g, '');
                return !isValidLuhn(rawCardNumber) || rawCardNumber.length !== 16 ? 'Invalid card number.' : undefined;
            case 'expiry':
                if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
                    return 'Use MM/YY format.';
                }
                const [monthStr, yearStr] = value.split('/');
                const expMonth = parseInt(monthStr, 10);
                const expYear = parseInt(yearStr, 10);
                const today = new Date();
                const currentYear = today.getFullYear() % 100;
                const currentMonth = today.getMonth() + 1;
                if (expYear < currentYear) {
                    return 'Card year is in the past.';
                }
                if (expYear === currentYear && expMonth < currentMonth) {
                    return 'Card is expired.';
                }
                return undefined;
            case 'cvc':
                return !/^\d{3,4}$/.test(value) ? 'Must be 3 or 4 digits.' : undefined;
            case 'address':
                return !value.trim() ? 'Address is required.' : undefined;
            case 'zip':
                return value.length < 5 ? 'Invalid ZIP.' : undefined;
            default:
                return undefined;
        }
    }, []);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { name, value } = e.target;
        
        if (name === 'number') {
            value = value.replace(/[^\d]/g, '').slice(0, 16);
            value = value.replace(/(.{4})/g, '$1 ').trim();
        } else if (name === 'expiry') {
            value = value.replace(/[^\d]/g, '').slice(0, 4);
            if (value.length > 2) {
                value = `${value.slice(0, 2)}/${value.slice(2)}`;
            }
        } else if (name === 'cvc') {
            value = value.replace(/[^\d]/g, '').slice(0, 4);
        } else if (name === 'zip') {
             value = value.replace(/[^\d]/g, '').slice(0, 5);
        }

        setCardData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: validateField(name, value)}));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string | undefined } = {};
        let formIsValid = true;
        
        Object.keys(cardData).forEach(key => {
            const fieldName = key as keyof typeof cardData;
            const error = validateField(fieldName, cardData[fieldName]);
            if (error) {
                newErrors[fieldName] = error;
                formIsValid = false;
            }
        });

        setErrors(newErrors);
        return formIsValid;
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setStatus('connecting');
        setTimeout(() => {
            const avsPass = cardData.zip === '90210';
            setVerificationResults(prev => ({...prev, avs: avsPass}));
            setStatus('verifying_avs');

            setTimeout(() => {
                if (!avsPass) {
                    setStatus('error');
                    setTimeout(() => onTransactionComplete(false), 2500);
                    return;
                }
                
                const cvvPass = cardData.cvc.startsWith('123');
                setVerificationResults(prev => ({...prev, cvv: cvvPass}));
                setStatus('verifying_cvv');

                setTimeout(() => {
                    if (!cvvPass) {
                         setStatus('error');
                         setTimeout(() => onTransactionComplete(false), 2500);
                         return;
                    }
                    
                    setStatus('processing');
                    setTimeout(() => {
                        const success = cardData.number.startsWith('4242');
                        setStatus(success ? 'success' : 'error');
                        setTimeout(() => {
                            onTransactionComplete(success);
                        }, 2500);
                    }, 1500);
                }, 1500);
            }, 1500);
        }, 1000);
    };

    const StatusDisplay = useMemo(() => {
        const baseClasses = "text-center p-4 rounded-lg transition-all duration-300";
        switch (status) {
            case 'connecting':
                return <div className={`${baseClasses} bg-blue-500/20`}><p className="font-bold text-blue-300">Connecting to Stripe...</p></div>;
            case 'verifying_avs':
                return <div className={`${baseClasses} bg-purple-500/20`}><p className="font-bold text-purple-300">Verifying Address (AVS)...</p></div>;
            case 'verifying_cvv':
                return <div className={`${baseClasses} bg-teal-500/20`}><p className="font-bold text-teal-300">Verifying CVV...</p></div>;
            case 'processing':
                return <div className={`${baseClasses} bg-indigo-500/20`}><p className="font-bold text-indigo-300">Submitting Charge...</p></div>;
            case 'success':
                return <div className={`${baseClasses} bg-green-500/20 flex flex-col items-center gap-2`}>
                    <CheckCircleIcon className="w-8 h-8 text-green-400" />
                    <p className="font-bold text-green-400">Payment Successful</p>
                    <div className="text-xs text-green-500/80 flex gap-4 mt-1">
                        <span>AVS Check: Pass</span>
                        <span>CVV Check: Pass</span>
                    </div>
                </div>;
            case 'error':
                 let errorMessage = 'Transaction was declined by the bank.';
                 if (!verificationResults.avs) errorMessage = 'Address Verification (AVS) Failed.';
                 else if (!verificationResults.cvv) errorMessage = 'CVV Verification Failed.';
                 return <div className={`${baseClasses} bg-red-500/20 flex flex-col items-center gap-2`}>
                     <XIcon className="w-8 h-8 text-red-400" />
                     <p className="font-bold text-red-400">Payment Failed</p>
                     <p className="text-xs text-red-500">{errorMessage}</p>
                 </div>;
            default:
                return null;
        }
    }, [status, verificationResults]);
    
    const isProcessing = ['connecting', 'verifying_avs', 'verifying_cvv', 'processing', 'success', 'error'].includes(status);

    return (
        <div className={`bg-gray-800 rounded-lg shadow-2xl border border-gray-700 flex flex-col transition-all duration-300 ${chargeAmount === null ? 'h-40' : 'h-auto'}`}>
            <div className="flex items-center justify-between bg-gray-700/80 px-4 py-3 rounded-t-lg border-b border-gray-600">
                <div className="flex items-center gap-2">
                    <CreditCardIcon className="w-5 h-5 text-blue-400" />
                    <h3 className="text-sm font-bold text-gray-200">Live Payment Terminal</h3>
                </div>
                <span className="text-xs font-semibold text-gray-400">Powered by Stripe</span>
            </div>

            <div className="flex-1 p-4 flex flex-col justify-center">
                {status === 'idle' && (
                    <div className="text-center">
                        <p className="text-gray-400 text-sm">Waiting for invoice...</p>
                        <p className="text-3xl font-mono font-bold text-gray-600 mt-2">{formatCurrency(0)}</p>
                    </div>
                )}
                {chargeAmount !== null && (
                     <div className="space-y-4">
                        <div className="text-center">
                             <p className="text-gray-400 text-sm">TOTAL AMOUNT</p>
                             <p className="text-3xl font-mono font-bold text-gray-100">{formatCurrency(chargeAmount)}</p>
                        </div>
                        
                        {isProcessing ? StatusDisplay : (
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div className="p-3 bg-red-900/50 border border-red-700/50 rounded-lg text-center">
                                    <p className="text-xs text-red-300 font-semibold">SIMULATION ONLY: Do not use real card numbers.</p>
                                    <p className="text-xs text-red-400">Use test card <code className="font-mono">4242...</code>, ZIP <code className="font-mono">90210</code>, and CVC <code className="font-mono">123</code> for a successful transaction.</p>
                                </div>
                                
                                <div>
                                    <input type="text" name="name" value={cardData.name} onChange={handleInputChange} onBlur={handleBlur} placeholder="Name on Card" className={`w-full bg-gray-900/50 text-gray-200 placeholder-gray-500 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`} disabled={isProcessing} aria-invalid={!!errors.name}/>
                                    {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                                </div>
                                
                                <div>
                                    <div className="relative">
                                        <input type="text" name="number" value={cardData.number} onChange={handleInputChange} onBlur={handleBlur} placeholder="0000 0000 0000 0000" className={`w-full bg-gray-900/50 text-gray-200 placeholder-gray-500 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.number ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`} disabled={isProcessing} aria-invalid={!!errors.number}/>
                                        <ChipIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                                    </div>
                                    {errors.number && <p className="text-xs text-red-400 mt-1">{errors.number}</p>}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <input type="text" name="expiry" value={cardData.expiry} onChange={handleInputChange} onBlur={handleBlur} placeholder="MM/YY" className={`w-full bg-gray-900/50 text-gray-200 placeholder-gray-500 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.expiry ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`} disabled={isProcessing} aria-invalid={!!errors.expiry}/>
                                        {errors.expiry && <p className="text-xs text-red-400 mt-1">{errors.expiry}</p>}
                                    </div>
                                    <div>
                                        <input type="text" name="cvc" value={cardData.cvc} onChange={handleInputChange} onBlur={handleBlur} placeholder="CVC" className={`w-full bg-gray-900/50 text-gray-200 placeholder-gray-500 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.cvc ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`} disabled={isProcessing} aria-invalid={!!errors.cvc}/>
                                        {errors.cvc && <p className="text-xs text-red-400 mt-1">{errors.cvc}</p>}
                                    </div>
                                </div>

                                <div>
                                    <input type="text" name="address" value={cardData.address} onChange={handleInputChange} onBlur={handleBlur} placeholder="Billing Address" className={`w-full bg-gray-900/50 text-gray-200 placeholder-gray-500 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`} disabled={isProcessing} aria-invalid={!!errors.address}/>
                                    {errors.address && <p className="text-xs text-red-400 mt-1">{errors.address}</p>}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <input type="text" name="city" value={cardData.city} onChange={handleInputChange} placeholder="City" className={`w-full bg-gray-900/50 text-gray-200 placeholder-gray-500 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 border-gray-600 focus:ring-blue-500`} disabled={isProcessing}/>
                                    </div>
                                    <div>
                                        <input type="text" name="zip" value={cardData.zip} onChange={handleInputChange} onBlur={handleBlur} placeholder="ZIP Code" className={`w-full bg-gray-900/50 text-gray-200 placeholder-gray-500 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors.zip ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`} disabled={isProcessing} aria-invalid={!!errors.zip}/>
                                        {errors.zip && <p className="text-xs text-red-400 mt-1">{errors.zip}</p>}
                                    </div>
                                </div>

                                <button type="submit" disabled={isProcessing} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 px-4 rounded-md hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isProcessing ? <LoadingIcon className="w-5 h-5 animate-spin" /> : <CreditCardIcon className="w-5 h-5" />}
                                    Process Payment
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
