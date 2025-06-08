export interface Task {
  title: string;
  category: string;
}

export const taskCategories = [
  "Revenue & Receivables",
  "Payables & Expenses",
  "Bank & Cash",
  "Fixed Assets & Depreciation",
  "Financial Statements & Reporting",
  "Close Process Management",
] as const;

export const predefinedTasks: Task[] = [
  // Revenue & Receivables
  {
    title: "Finalize revenue recognition",
    category: "Revenue & Receivables",
  },
  {
    title: "Review accounts receivable aging",
    category: "Revenue & Receivables",
  },
  {
    title: "Reconcile deferred revenue",
    category: "Revenue & Receivables",
  },

  // Payables & Expenses
  {
    title: "Verify accrued expenses",
    category: "Payables & Expenses",
  },
  {
    title: "Review accounts payable aging",
    category: "Payables & Expenses",
  },
  {
    title: "Review prepaids and post amortization",
    category: "Payables & Expenses",
  },
  {
    title: "Review open purchase orders",
    category: "Payables & Expenses",
  },

  // Bank & Cash
  {
    title: "Reconcile bank accounts",
    category: "Bank & Cash",
  },
  {
    title: "Reconcile credit card accounts",
    category: "Bank & Cash",
  },
  {
    title: "Reconcile payment processor balances (e.g., Stripe, PayPal)",
    category: "Bank & Cash",
  },
  {
    title: "Reconcile payroll accounts",
    category: "Bank & Cash",
  },
  {
    title: "Update cash flow forecast",
    category: "Bank & Cash",
  },

  // Fixed Assets & Depreciation
  {
    title: "Post depreciation and amortization",
    category: "Fixed Assets & Depreciation",
  },
  {
    title: "Confirm fixed asset additions/disposals",
    category: "Fixed Assets & Depreciation",
  },

  // Financial Statements & Reporting
  {
    title: "Review balance sheet for anomalies",
    category: "Financial Statements & Reporting",
  },
  {
    title: "Review profit and loss for anomalies",
    category: "Financial Statements & Reporting",
  },
  {
    title: "Update and validate trial balance",
    category: "Financial Statements & Reporting",
  },
  {
    title: "Prepare management reports (P&L, BS, CF)",
    category: "Financial Statements & Reporting",
  },
  {
    title: "Send financial statements for internal review",
    category: "Financial Statements & Reporting",
  },

  // Close Process Management
  {
    title: "Review and post recurring journal entries",
    category: "Close Process Management",
  },
  {
    title: "Reconcile intercompany transactions",
    category: "Close Process Management",
  },
  {
    title: "Verify loan balances and interest accruals",
    category: "Close Process Management",
  },
  {
    title: "Reconcile inventory balances (if applicable)",
    category: "Close Process Management",
  },
  {
    title: "Resolve outstanding close tasks",
    category: "Close Process Management",
  },
  {
    title: "Mark close cycle as complete",
    category: "Close Process Management",
  },
]; 