
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { AssistantPanel } from './components/AssistantPanel';
import { ToolsPanel } from './components/ToolsPanel';
import { AccountsPanel } from './components/AccountsPanel';
import { ClientManagementPanel } from './components/ClientManagementPanel';
import { ScreenCaptureView } from './components/ScreenCaptureView';
import { InvoicePreview } from './components/TerminalView'; // repurposed component
import { PaymentLinkView } from './components/BrowserActionView'; // repurposed component
import { LiveTerminalView } from './components/LiveTerminalView';
import { RecurringInvoicesPanel } from './components/RecurringInvoicesPanel';
import { MarketTicker } from './components/MarketTicker';
import { InvestmentPanel } from './components/InvestmentPanel';
import { PropertyWatchlistPanel } from './components/PropertyWatchlistPanel';
import type { ChatMessage, Invoice, RecurringInvoice, Client, InvestmentAccount, TickerItem, Property } from './types';
import { getAssistance, getConversationalAssistance, generatePropertyListing } from './services/geminiService';
import { calculateNextDueDate } from './utils/dateHelper';

// FIX: Add type definition for the ImageCapture API which may not be present in default TypeScript typings.
declare class ImageCapture {
  constructor(track: MediaStreamTrack);
  grabFrame(): Promise<ImageBitmap>;
}

const initialTickerData: TickerItem[] = [
    { symbol: 'BTC', price: 68050.55, change: 125.10, changePercent: 0.18 },
    { symbol: 'ETH', price: 3550.75, change: -15.42, changePercent: -0.43 },
    { symbol: 'TSLA', price: 177.48, change: 2.15, changePercent: 1.22 },
    { symbol: 'NVDA', price: 120.91, change: -1.05, changePercent: -0.86 },
    { symbol: 'AAPL', price: 214.29, change: 3.55, changePercent: 1.68 },
    { symbol: 'SOL', price: 135.21, change: 4.88, changePercent: 3.74 },
];


const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'bot',
      content: "Hello! I'm PayPilot. You can now create one-off or recurring invoices (e.g., 'Set up a monthly invoice for Client X for $500').",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<{message: string; link: string; method?: string;} | null>(null);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>(['PayPal']);
  const [terminalChargeAmount, setTerminalChargeAmount] = useState<number | null>(null);
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([]);
  const [clients, setClients] = useState<Client[]>([
    { id: 'client_1', name: 'Innovate LLC' },
    { id: 'client_2', name: 'Apex Solutions' },
  ]);
  const [assistantInputValue, setAssistantInputValue] = useState('');
  const [investmentAccounts, setInvestmentAccounts] = useState<InvestmentAccount[]>([]);
  const [tickerData, setTickerData] = useState<TickerItem[]>(initialTickerData);
  const [propertyWatchlist, setPropertyWatchlist] = useState<Property[]>([]);

  // Ticker data simulation effect
  useEffect(() => {
    const tickerInterval = setInterval(() => {
        setTickerData(prevData =>
            prevData.map(item => {
                const changeAmount = (item.price * (Math.random() - 0.5) * 0.01); // Max 0.5% fluctuation
                const newPrice = item.price + changeAmount;
                const newChange = item.change + changeAmount;
                const basePrice = newPrice - newChange;
                const newChangePercent = (newChange / basePrice) * 100;

                return {
                    symbol: item.symbol,
                    price: newPrice,
                    change: newChange,
                    changePercent: newChangePercent
                };
            })
        );
    }, 2000);

    return () => clearInterval(tickerInterval);
  }, []);


  // Simulate checking for due recurring invoices every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
        const now = new Date();
        setRecurringInvoices(prev => 
            prev.map(inv => {
                if (!inv.isDueForApproval && new Date(inv.nextDueDate) <= now) {
                    return { ...inv, isDueForApproval: true };
                }
                return inv;
            })
        );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleConnectAccount = useCallback((account: string) => {
    setConnectedAccounts(prev => [...new Set([...prev, account])]);
  }, []);

  const handleDisconnectAccount = useCallback((account: string) => {
    setConnectedAccounts(prev => prev.filter(a => a !== account));
  }, []);

  const handleConnectInvestmentAccount = useCallback((id: 'robinhood' | 'metamask') => {
    const newAccount: InvestmentAccount = {
        id,
        name: id === 'robinhood' ? 'Robinhood' : 'MetaMask',
        balance: Math.random() * (id === 'robinhood' ? 50000 : 25) + (id === 'robinhood' ? 1000 : 5), // Random balance
    };
    setInvestmentAccounts(prev => [...prev, newAccount]);
  }, []);

  const handleDisconnectInvestmentAccount = useCallback((id: 'robinhood' | 'metamask') => {
      setInvestmentAccounts(prev => prev.filter(acc => acc.id !== id));
  }, []);


  const handleAddClient = useCallback((name: string) => {
    if (name.trim() && !clients.some(c => c.name.toLowerCase() === name.trim().toLowerCase())) {
        const newClient: Client = { id: `client_${Date.now()}`, name: name.trim() };
        setClients(prev => [newClient, ...prev]);
    }
  }, [clients]);

  const handleDeleteClient = useCallback((clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
  }, []);

  const handleInvoiceClient = useCallback((clientName: string) => {
    setAssistantInputValue(`Create an invoice for ${clientName} for `);
  }, []);

  const handleFindProperty = useCallback(async () => {
    setIsLoading(true);
    setChatHistory(prev => [...prev, { role: 'user', content: "Find a new property investment opportunity." }]);
    try {
        const propertyJson = await generatePropertyListing();
        const newProperty: Property = JSON.parse(propertyJson);
        newProperty.id = `prop_${Date.now()}`;
        setPropertyWatchlist(prev => [newProperty, ...prev]);
        setChatHistory(prev => [...prev, { role: 'bot', content: `I've found a new opportunity: a ${newProperty.type} at ${newProperty.address}. I've added it to your watchlist for review.` }]);
    } catch (error) {
        console.error("Error generating property:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        setChatHistory(prev => [...prev, { role: 'bot', content: `Sorry, I couldn't find a property right now: ${errorMessage}` }]);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleDeleteProperty = useCallback((propertyId: string) => {
    setPropertyWatchlist(prev => prev.filter(p => p.id !== propertyId));
  }, []);


  const handleFileAnalysis = useCallback(async (fileContent: string) => {
    const prompt = `Please act as a financial analyst. Analyze the following data, which could be an exported transaction history (CSV) or another document. Summarize the key financial activities, identify major income sources or expenses, and highlight any notable trends. Format the output clearly.\n\nData:\n${fileContent}`;

    const userMessageForHistory = "I've uploaded a file for analysis. Here are the insights:";

    setIsLoading(true);
    setChatHistory(prev => [...prev, { role: 'user', content: "Analyzing uploaded file..." }]);

    try {
        const response = await getAssistance(prompt, null);
        setChatHistory(prev => {
            const newHistory = [...prev];
            const lastMessageIndex = newHistory.length - 1;
            if(newHistory[lastMessageIndex].role === 'user' && newHistory[lastMessageIndex].content.startsWith("Analyzing")) {
                newHistory.pop(); 
            }
            return [...newHistory, { role: 'user', content: userMessageForHistory }, { role: 'bot', content: response }];
        });
    } catch (error) {
        console.error("Error from Gemini API during file analysis:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        setChatHistory(prev => [...prev, { role: 'bot', content: `Sorry, I ran into an issue during the file analysis: ${errorMessage}` }]);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // When the component unmounts, cancel any lingering speech synthesis.
    return () => {
        window.speechSynthesis.cancel();
    }
  }, []);

  // Effect to speak bot messages when TTS is enabled
  useEffect(() => {
    if (!isTtsEnabled || !chatHistory.length || isLoading) return;

    const lastMessage = chatHistory[chatHistory.length - 1];
    if (lastMessage.role === 'bot' && lastMessage.content) {
        window.speechSynthesis.cancel(); // Stop any previous speech
        const textToSpeak = lastMessage.content.replace(/<[^>]*>/g, '');
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        window.speechSynthesis.speak(utterance);
    }
  }, [chatHistory, isTtsEnabled, isLoading]);


  const takeScreenshot = useCallback(async (): Promise<string | null> => {
    if (!screenStream) return null;
    const videoTrack = screenStream.getVideoTracks()[0];
    if (!videoTrack || videoTrack.readyState !== 'live') {
        console.warn("Video track not available or not live.");
        return null;
    }

    try {
      const imageCapture = new ImageCapture(videoTrack);
      const bitmap = await imageCapture.grabFrame();
      
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext('2d');
      if (!context) return null;
      
      context.drawImage(bitmap, 0, 0);
      return canvas.toDataURL('image/jpeg').split(',')[1];
    } catch (error) {
      console.error("Error taking screenshot:", error);
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      return null;
    }
  }, [screenStream]);

  const handleSendMessage = useCallback(async (message: string, withScreenshot: boolean = false) => {
    if (isLoading || !message.trim()) return;
    
    setAssistantInputValue(''); // Clear input on submit
    window.speechSynthesis.cancel();
    setIsLoading(true);
    setInvoice(null);
    setPaymentInfo(null);
    setTerminalChargeAmount(null);
    setChatHistory(prev => [...prev, { role: 'user', content: message }]);

    let screenshotBase64: string | null = null;
    if (withScreenshot && screenStream) {
        screenshotBase64 = await takeScreenshot();
    }
    
    try {
      const fullResponse = await getConversationalAssistance(chatHistory, message, screenshotBase64, connectedAccounts);
      
      let invoiceData: Invoice & Partial<RecurringInvoice> | null = null;
      try {
        invoiceData = JSON.parse(fullResponse);
        if (invoiceData && invoiceData.customerName && invoiceData.items) {
           handleAddClient(invoiceData.customerName); // Automatically add new clients
           if (invoiceData.isRecurring && invoiceData.recurrenceFrequency && invoiceData.startDate) {
                const newRecurringInvoice: RecurringInvoice = {
                    ...invoiceData,
                    id: `recur_${Date.now()}`,
                    isRecurring: true,
                    recurrenceFrequency: invoiceData.recurrenceFrequency,
                    startDate: invoiceData.startDate,
                    nextDueDate: invoiceData.startDate,
                    isDueForApproval: false,
                };
                setRecurringInvoices(prev => [...prev, newRecurringInvoice]);
                setChatHistory(prev => [...prev, { role: 'bot', content: `I've scheduled a new ${invoiceData.recurrenceFrequency} recurring invoice for ${invoiceData.customerName}. You can manage it in the recurring invoices panel.` }]);
           } else {
                setInvoice(invoiceData);
                setChatHistory(prev => [...prev, { role: 'bot', content: "I've drafted an invoice based on your request. Please review the details." }]);
           }
        } else {
          throw new Error("Parsed JSON does not match invoice structure.");
        }
      } catch (e) {
        setChatHistory(prev => [...prev, { role: 'bot', content: fullResponse }]);
      }

      if(withScreenshot) {
        setAiAnalysis("I've analyzed the screen. See my response in the chat.");
      }
    } catch (error) {
      console.error("Error from Gemini API:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setChatHistory(prev => [...prev, { role: 'bot', content: `Sorry, I ran into an issue: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, screenStream, chatHistory, takeScreenshot, connectedAccounts, handleAddClient]);

  const handleGeneratePaymentLink = async (invoiceData: Invoice, total: number) => {
    setIsLoading(true);
    setInvoice(null); 
    const method = invoiceData.paymentMethod || 'default';

    const prompt = `Generate a short, friendly ${method} payment request message for ${invoiceData.customerName} for the amount of $${total.toFixed(2)}. The message should be polite and concise.`;
    
    setChatHistory(prev => [...prev, { role: 'user', content: `Generate ${method} payment link for ${invoiceData.customerName}` }]);

    try {
        const message = await getAssistance(prompt, null);
        const randomId = Math.random().toString(36).substring(2, 10);
        let link = `https://pay.pilot-demo.com/inv_${randomId}`;

        const lowerMethod = method.toLowerCase();
        if (lowerMethod.includes('paypal')) link = `https://paypal.me/paypilot_demo/${total.toFixed(2)}`;
        else if (lowerMethod.includes('venmo')) link = `https://venmo.com/paypilot_demo?txn=pay&amount=${total.toFixed(2)}`;
        else if (lowerMethod.includes('cash')) link = `https://cash.app/$PayPilotDemo/${total.toFixed(2)}`;

        setPaymentInfo({
            message,
            link: link,
            method: method,
        });
        setChatHistory(prev => [...prev, { role: 'bot', content: "Here is a shareable payment message and link." }]);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        setChatHistory(prev => [...prev, { role: 'bot', content: `Sorry, I ran into an issue: ${errorMessage}` }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleInitiateTerminalCharge = (amount: number) => {
    setInvoice(null);
    setPaymentInfo(null);
    setTerminalChargeAmount(amount);
    setChatHistory(prev => [...prev, { role: 'bot', content: `The live terminal is now active for a charge of $${amount.toFixed(2)}.` }]);
  };
  
  const handleTransactionComplete = (success: boolean) => {
    const finalAmount = terminalChargeAmount;
    setTerminalChargeAmount(null);
    const message = success 
      ? `Successfully processed a payment of $${finalAmount?.toFixed(2)} through the terminal.`
      : `The payment of $${finalAmount?.toFixed(2)} failed or was cancelled.`;
    setChatHistory(prev => [...prev, { role: 'bot', content: message }]);
  };


  const handleStartScreenShare = async () => {
    if (screenStream) {
        handleStopScreenShare();
        return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      stream.getVideoTracks()[0].addEventListener('ended', handleStopScreenShare);
      setScreenStream(stream);
      setAiAnalysis("Screen sharing started. Ask me to create an invoice from what you see!");
    } catch (error) {
      console.error("Error starting screen share:", error);
      setChatHistory(prev => [...prev, { role: 'bot', content: "Could not start screen sharing. Please ensure you've granted permission." }]);
    }
  };

  const handleStopScreenShare = useCallback(() => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => {
        track.removeEventListener('ended', handleStopScreenShare);
        track.stop();
      });
      setScreenStream(null);
      setAiAnalysis(null);
    }
  }, [screenStream]);
  
  const toggleTts = () => {
    setIsTtsEnabled(prev => {
        if (prev) {
            window.speechSynthesis.cancel();
        }
        return !prev;
    });
  }

  const handleApproveRecurringInvoice = (invoiceId: string) => {
    const recurring = recurringInvoices.find(inv => inv.id === invoiceId);
    if (!recurring) return;

    const invoiceToDraft: Invoice = {
      customerName: recurring.customerName,
      items: recurring.items,
      dueDate: new Date().toISOString().split('T')[0],
      notes: recurring.notes,
      paymentMethod: recurring.paymentMethod,
    };
    setInvoice(invoiceToDraft);

    setRecurringInvoices(prev => 
      prev.map(inv => 
        inv.id === invoiceId 
        ? {
            ...inv, 
            isDueForApproval: false,
            nextDueDate: calculateNextDueDate(inv.nextDueDate, inv.recurrenceFrequency),
          }
        : inv
      )
    );

    setChatHistory(prev => [...prev, { role: 'bot', content: `Invoice for ${recurring.customerName} is now drafted and ready for action.` }]);
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header 
        isTtsEnabled={isTtsEnabled}
        onToggleTts={toggleTts}
      />
      <MarketTicker items={tickerData} />
      <main className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <AssistantPanel
            chatHistory={chatHistory}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onStartScreenShare={handleStartScreenShare}
            isSharingScreen={!!screenStream}
            inputValue={assistantInputValue}
            onInputChange={setAssistantInputValue}
          />
          {screenStream && (
            <ScreenCaptureView 
                stream={screenStream} 
                analysis={aiAnalysis}
                onStop={handleStopScreenShare}
            />
          )}
        </div>
        <div className="lg:col-span-1 flex flex-col gap-8">
          <AccountsPanel
            connectedAccounts={connectedAccounts}
            onConnect={handleConnectAccount}
            onDisconnect={handleDisconnectAccount}
          />
           <InvestmentPanel 
            accounts={investmentAccounts}
            onConnect={handleConnectInvestmentAccount}
            onDisconnect={handleDisconnectInvestmentAccount}
          />
          <PropertyWatchlistPanel
            properties={propertyWatchlist}
            onFindProperty={handleFindProperty}
            onDeleteProperty={handleDeleteProperty}
            isLoading={isLoading}
           />
          <ClientManagementPanel
            clients={clients}
            onAddClient={handleAddClient}
            onDeleteClient={handleDeleteClient}
            onInvoiceClient={handleInvoiceClient}
          />
          <RecurringInvoicesPanel 
            invoices={recurringInvoices} 
            onApprove={handleApproveRecurringInvoice} 
          />
          <LiveTerminalView 
            chargeAmount={terminalChargeAmount}
            onTransactionComplete={handleTransactionComplete}
          />
          <ToolsPanel 
            onAnalyzeFile={handleFileAnalysis}
          />
          {invoice && (
            <InvoicePreview 
                invoice={invoice} 
                onGenerateLink={handleGeneratePaymentLink} 
                onChargeWithTerminal={handleInitiateTerminalCharge}
                onClose={() => setInvoice(null)} 
            />
          )}
          {paymentInfo && <PaymentLinkView paymentInfo={paymentInfo} onClose={() => setPaymentInfo(null)} />}
        </div>
      </main>
    </div>
  );
};

export default App;