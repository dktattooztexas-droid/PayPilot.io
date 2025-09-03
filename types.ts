export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  customerName: string;
  items: InvoiceItem[];
  dueDate: string;
  notes?: string;
  paymentMethod?: string;
}

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringInvoice extends Invoice {
  id: string;
  isRecurring: true;
  recurrenceFrequency: RecurrenceFrequency;
  startDate: string; // YYYY-MM-DD
  nextDueDate: string; // YYYY-MM-DD
  isDueForApproval?: boolean;
}


export type TerminalState = 'idle' | 'awaiting_input' | 'connecting' | 'verifying_avs' | 'verifying_cvv' | 'processing' | 'success' | 'error';

export interface Client {
  id: string;
  name: string;
}

export interface InvestmentAccount {
  id: 'robinhood' | 'metamask';
  name: string;
  balance: number;
}

export interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface Property {
    id: string;
    address: string;
    price: number;
    beds: number;
    baths: number;
    sqft: number;
    type: 'Foreclosure' | 'Rental Prospect' | 'Below Market' | 'Fixer-upper';
    analysis: string;
}