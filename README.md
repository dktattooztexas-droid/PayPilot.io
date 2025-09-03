# PayPilot - Your AI Payment Assistant

> Powered by the Google Gemini API

Your intelligent assistant for creating invoices and managing payments.

PayPilot is a powerful, AI-driven assistant designed for freelancers, small business owners, and anyone looking to streamline their payment workflow. It acts as an expert partner, turning your natural language requests into structured invoices and providing insights into your financial data.

## ✨ Key Features

-   **🤖 AI-Powered Invoice Creation:** Simply describe the bill you want to create in plain English. PayPilot understands your request, extracts the details, and drafts a professional invoice for your review.
-   **🔄 Recurring Invoices & Subscriptions:** Schedule recurring payments with natural language. Say "Set up a monthly invoice for..." and PayPilot will automatically track the schedule and prompt you for one-click approval when an invoice is ready to be sent.
-   **👥 Client Management (Mini-CRM):** Automatically builds a client list as you create invoices. A dedicated panel allows you to add, delete, and instantly start new invoices for saved clients.
-   **🔗 Multi-Account Integration:** Connect your favorite payment providers like PayPal, Venmo, and Cash App. Ask PayPilot to create service-specific requests (e.g., "Send a Venmo request...") for a seamless workflow.
-   **💳 Live Payment Terminal:** Process payments directly within the app using a simulated Stripe-powered terminal. This simulation includes secure, industry-standard verification steps like **AVS (Address Verification System)** and CVV checks for a realistic end-to-end transaction experience.
-   **📈 Investment & Market Tracking:** Connect simulated investment accounts like Robinhood (stocks) and MetaMask (crypto) to see your portfolio balances. A live, Bloomberg-style market ticker keeps you updated on the latest (simulated) prices for major stocks and cryptocurrencies.
-   **🏡 AI-Powered Property Watchlist:** Discover and track simulated property investment opportunities. A dedicated AI generates realistic listings for scenarios like foreclosures or below-market-value deals, complete with details and investment analysis, allowing you to manage a virtual portfolio.
-   **🎤 Voice-First Interface:** Interact with PayPilot using your voice for commands and listen to its responses read aloud automatically for a hands-free experience.
-   **🖥️ Screen Analysis:** Share your screen showing a timesheet, project summary, or list of services. PayPilot can read the content to help create an accurate invoice, reducing manual data entry.
-   **🔗 Branded Payment Links:** Instantly create a shareable message and a simulated payment link for your generated invoice, customized for the selected payment provider.
-   **📂 Financial Data Analysis:** Upload a text-based file (like a CSV export of your transaction history) and ask PayPilot to analyze it. It can summarize your income, identify trends, and provide actionable insights.

## 🚀 The PayPilot Workflow

PayPilot empowers you by pairing your control with its intelligence. Here’s the primary workflow:

### 1. The Setup: Connect Your Accounts

In the **Connected Accounts** and **Investment Platforms** panels, you can "connect" your payment and investment services. This gives you a complete financial overview.

### 2. The Ask: From Intent to Invoice

Instead of manually filling out invoice templates, simply tell PayPilot what you need. You can use the **Client Management** panel to pre-fill the client's name or just type freely.

> **One-Off Example:** "Create a PayPal invoice for Smith Designs for 25 hours of web development at $120/hr, due at the end of the month."
> **Recurring Example:** "Set up a monthly retainer invoice for Client Co. for $2,500, starting on the 1st."

PayPilot will analyze your request. For a one-off invoice, it will generate a draft in the **Invoice Preview**. If the customer is new, they will be **automatically saved** to your Client Management list. For a recurring invoice, it will schedule it in the new **Recurring Invoices** panel and confirm in the chat.

### 3. The Review & Approval

-   **For one-off invoices:** Review the draft in the preview panel to ensure every detail is correct.
-   **For recurring invoices:** The system tracks the schedule. When an invoice is due, it will appear with an "Approve & Draft" button. Clicking this generates the invoice draft for your final review in the preview panel.

### 4. The Action: Get Paid in Two Ways

Once you are satisfied with the invoice draft, you have two options:

#### Option A: Charge Directly with the Terminal
1.  Click the **"Charge Card"** button in the Invoice Preview.
2.  The **Live Payment Terminal** will activate, displaying the total amount due.
3.  Enter the client's card information and billing address into the secure form. **(This is a simulation—do not use real card numbers).**
4.  Click "Process Payment." The terminal will show a live status as it simulates connecting to Stripe, performing AVS and CVV checks, and processing the charge. You'll receive a clear success or failure confirmation.

#### Option B: Generate a Payment Link
1.  Click the **"Send Link"** button.
2.  PayPilot will create a professional, friendly message and a unique, branded payment link (e.g., a `paypal.me` link).
3.  Click the **"Copy Message & Link"** button and send it to your client.

### 5. The Analysis: From Data to Insight

For a broader view of your finances:
1.  Export your transaction history from your bank or accounting software as a CSV or text file.
2.  In the **Payment Tools** panel, click "Analyze Local File" and select your exported file.
3.  PayPilot will process the data and provide a clear, human-readable summary, helping you understand your financial activity.

## 🛠️ Setup & Running

This application is a static web app that runs entirely in the browser.

### Prerequisites

-   A modern web browser (e.g., Google Chrome, Mozilla Firefox) that supports screen sharing.
-   A valid Google Gemini API Key.

### Configuration

The application requires a Google Gemini API key to function. This key must be made available as an environment variable named `API_KEY`.

**The application is built to read this key from its execution environment automatically. You do not need to modify the source code.**

### Running the Application

1.  Ensure the `API_KEY` environment variable is set in your deployment or local environment.
2.  Serve the project files using any static file server.
3.  Open the `index.html` file in your web browser. PayPilot will be ready to use.