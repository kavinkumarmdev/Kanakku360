import type {
  Transaction,
  Category,
  Account,
  Budget,
  SavingsGoal,
  AppSettings,
  Loan,
  SavingScheme,
  FarmField,
  FarmWorker,
  FamilyMember,
  TreeHarvestEntry,
  FarmLivestock,
} from '../types/finance';

export interface SheetFullPayload {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  goals: SavingsGoal[];
  loans?: Loan[];
  savings?: SavingScheme[];
  fields?: FarmField[];
  treeHarvests?: TreeHarvestEntry[];
  livestock?: FarmLivestock[];
  workers?: FarmWorker[];
  familyMembers?: FamilyMember[];
  settings?: Partial<AppSettings> | Partial<AppSettings>[];
}

export interface SheetApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  timestamp?: string;
}

/**
 * Safely parses and normalizes raw data arrays returned from Google Sheets
 */
function normalizePayload(data: Partial<SheetFullPayload>): SheetFullPayload {
  const safeArray = (arr: any) => (Array.isArray(arr) ? arr : []);
  const safeJson = (val: any, fallback: any = []) => {
    if (!val) return fallback;
    if (typeof val === 'object') return val;
    if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
      try {
        return JSON.parse(val);
      } catch {
        return fallback;
      }
    }
    return fallback;
  };

  const transactions: Transaction[] = safeArray(data.transactions).map((tx: any) => ({
    id: String(tx.id || ''),
    date: String(tx.date || new Date().toISOString().split('T')[0]),
    type: (['expense', 'income', 'transfer'].includes(tx.type) ? tx.type : 'expense') as any,
    amount: Number(tx.amount) || 0,
    category: String(tx.category || ''),
    accountId: String(tx.accountId || ''),
    toAccountId: tx.toAccountId ? String(tx.toAccountId) : undefined,
    description: String(tx.description || ''),
    paymentMode: tx.paymentMode || 'cash',
    tags: Array.isArray(tx.tags) ? tx.tags : (typeof tx.tags === 'string' && tx.tags ? (tx.tags.startsWith('[') ? safeJson(tx.tags, []) : tx.tags.split(',').map((s: string) => s.trim()).filter(Boolean)) : []),
    createdAt: String(tx.createdAt || new Date().toISOString()),
    memberId: tx.memberId ? String(tx.memberId) : undefined,
    memberName: tx.memberName ? String(tx.memberName) : undefined,
    fieldId: tx.fieldId ? String(tx.fieldId) : undefined,
    fieldName: tx.fieldName ? String(tx.fieldName) : undefined,
    cropId: tx.cropId ? String(tx.cropId) : undefined,
    cropType: tx.cropType ? String(tx.cropType) : undefined,
    treeId: tx.treeId ? String(tx.treeId) : undefined,
    treeName: tx.treeName ? String(tx.treeName) : undefined,
    livestockId: tx.livestockId ? String(tx.livestockId) : undefined,
    livestockName: tx.livestockName ? String(tx.livestockName) : undefined,
    productionType: tx.productionType && ['milk', 'egg', 'live_animal', 'manure', 'meat', 'tree_harvest', 'crop_yield', 'salary', 'general'].includes(tx.productionType) ? tx.productionType : undefined,
    productionQuantity: tx.productionQuantity !== undefined && tx.productionQuantity !== '' ? Number(tx.productionQuantity) : undefined,
    productionUnitRate: tx.productionUnitRate !== undefined && tx.productionUnitRate !== '' ? Number(tx.productionUnitRate) : undefined,
    workerName: tx.workerName ? String(tx.workerName) : undefined,
    workerCount: tx.workerCount !== undefined && tx.workerCount !== '' ? Number(tx.workerCount) : undefined,
    workType: tx.workType ? String(tx.workType) : undefined,
    paymentStatus: tx.paymentStatus === 'pending' ? 'pending' : 'paid',
    dueDate: tx.dueDate ? String(tx.dueDate) : undefined,
  }));

  const accounts: Account[] = safeArray(data.accounts).map((acc: any) => ({
    id: String(acc.id || ''),
    name: String(acc.name || ''),
    type: acc.type || 'bank',
    balance: Number(acc.balance) || 0,
    accountNumber: acc.accountNumber ? String(acc.accountNumber) : undefined,
    icon: acc.icon || 'Building2',
    color: acc.color || '#0284C7',
    isDefault: Boolean(acc.isDefault === true || acc.isDefault === 'true'),
  }));

  const categories: Category[] = safeArray(data.categories).map((cat: any) => ({
    id: String(cat.id || ''),
    name: String(cat.name || ''),
    type: cat.type || 'expense',
    domain: cat.domain || 'other',
    icon: cat.icon || 'Tag',
    color: cat.color || '#3B82F6',
    budgetLimit: cat.budgetLimit !== undefined && cat.budgetLimit !== '' ? Number(cat.budgetLimit) : undefined,
  }));

  const budgets: Budget[] = safeArray(data.budgets).map((b: any) => ({
    id: String(b.id || ''),
    categoryId: String(b.categoryId || ''),
    categoryName: String(b.categoryName || ''),
    monthlyLimit: Number(b.monthlyLimit) || 0,
    month: Number(b.month) || (new Date().getMonth() + 1),
    year: Number(b.year) || new Date().getFullYear(),
  }));

  const goals: SavingsGoal[] = safeArray(data.goals).map((g: any) => ({
    id: String(g.id || ''),
    name: String(g.name || ''),
    targetAmount: Number(g.targetAmount) || 0,
    currentAmount: Number(g.currentAmount) || 0,
    targetDate: String(g.targetDate || ''),
    category: String(g.category || 'General'),
    icon: g.icon || 'Target',
    color: g.color || '#10B981',
    notes: g.notes ? String(g.notes) : undefined,
  }));

  const loans: Loan[] = safeArray(data.loans).map((l: any) => ({
    id: String(l.id || ''),
    name: String(l.name || ''),
    lenderBorrower: String(l.lenderBorrower || l.name || ''),
    type: (l.type === 'lent' ? 'lent' : 'borrowed') as any,
    principalAmount: Number(l.principalAmount ?? l.amount ?? 0),
    interestRate: Number(l.interestRate) || 0,
    interestType: (l.interestType === 'monthly_vatti' ? 'monthly_vatti' : 'yearly_pct') as any,
    emiAmount: l.emiAmount !== undefined && l.emiAmount !== '' ? Number(l.emiAmount) : (l.monthlyEmi !== undefined ? Number(l.monthlyEmi) : undefined),
    startDate: String(l.startDate || new Date().toISOString().split('T')[0]),
    tenureMonths: l.tenureMonths !== undefined && l.tenureMonths !== '' ? Number(l.tenureMonths) : undefined,
    dueDate: l.dueDate ? String(l.dueDate) : undefined,
    status: (l.status === 'closed' ? 'closed' : 'active') as any,
    notes: l.notes ? String(l.notes) : undefined,
    payments: safeJson(l.payments, []),
  }));

  const savings: SavingScheme[] = safeArray(data.savings).map((s: any) => ({
    id: String(s.id || ''),
    name: String(s.name || ''),
    institution: String(s.institution || s.name || ''),
    schemeType: (s.schemeType === 'fixed' ? 'fixed' : 'chit_fund') as any,
    totalValue: Number(s.totalValue ?? s.targetAmount ?? 0),
    totalInstallments: Number(s.totalInstallments ?? s.tenureMonths ?? 20),
    frequency: (s.frequency || 'monthly') as any,
    startDate: String(s.startDate || new Date().toISOString().split('T')[0]),
    dueDate: s.dueDate ? String(s.dueDate) : undefined,
    dueDayOfMonth: s.dueDayOfMonth !== undefined && s.dueDayOfMonth !== '' ? Number(s.dueDayOfMonth) : undefined,
    status: (s.status === 'completed' ? 'completed' : 'active') as any,
    notes: s.notes ? String(s.notes) : undefined,
    color: s.color ? String(s.color) : undefined,
    installments: safeJson(s.installments, []),
    bulkClaim: safeJson(s.bulkClaim, undefined),
    targetMaturityDate: s.targetMaturityDate ? String(s.targetMaturityDate) : undefined,
    expectedReturnRate: s.expectedReturnRate !== undefined && s.expectedReturnRate !== '' ? Number(s.expectedReturnRate) : undefined,
  }));

  const fields: FarmField[] = safeArray(data.fields).map((f: any) => ({
    id: String(f.id || ''),
    name: String(f.name || ''),
    areaAcre: Number(f.areaAcre) || 0,
    sizeUnit: f.sizeUnit || 'acres',
    color: f.color || '#10B981',
    hasBoundaryCoconut: Boolean(f.hasBoundaryCoconut === true || f.hasBoundaryCoconut === 'true'),
    boundaryTreeCount: Number(f.boundaryTreeCount) || 0,
    cropType: f.cropType ? String(f.cropType) : undefined,
    secondaryCrops: safeJson(f.secondaryCrops, []),
    trees: safeJson(f.trees, []),
    crops: safeJson(f.crops, []),
    treeHistory: safeJson(f.treeHistory, []),
    cropHistory: safeJson(f.cropHistory, []),
    notes: f.notes ? String(f.notes) : undefined,
    createdAt: f.createdAt ? String(f.createdAt) : undefined,
    updatedAt: f.updatedAt ? String(f.updatedAt) : undefined,
  }));

  const treeHarvests: TreeHarvestEntry[] = safeArray(data.treeHarvests).map((h: any) => ({
    id: String(h.id || ''),
    fieldId: String(h.fieldId || ''),
    treeId: String(h.treeId || ''),
    treeType: String(h.treeType || 'coconut'),
    date: String(h.date || ''),
    quantityHarvested: Number(h.quantityHarvested) || 0,
    unit: String(h.unit || 'nuts'),
    ratePerUnit: Number(h.ratePerUnit) || 0,
    totalIncome: Number(h.totalIncome) || 0,
    laborExpense: Number(h.laborExpense) || 0,
    netIncome: Number(h.netIncome) || 0,
    accountId: h.accountId ? String(h.accountId) : undefined,
    notes: h.notes ? String(h.notes) : undefined,
  }));

  const livestock: FarmLivestock[] = safeArray(data.livestock).map((lv: any) => ({
    id: String(lv.id || ''),
    name: String(lv.name || ''),
    type: lv.type || 'sheep',
    count: Number(lv.count) || 0,
    tagNumber: lv.tagNumber ? String(lv.tagNumber) : undefined,
    dailyMilkLiters: lv.dailyMilkLiters !== undefined && lv.dailyMilkLiters !== '' ? Number(lv.dailyMilkLiters) : undefined,
    milkRatePerLiter: lv.milkRatePerLiter !== undefined && lv.milkRatePerLiter !== '' ? Number(lv.milkRatePerLiter) : undefined,
    dailyEggCount: lv.dailyEggCount !== undefined && lv.dailyEggCount !== '' ? Number(lv.dailyEggCount) : undefined,
    eggRatePerPiece: lv.eggRatePerPiece !== undefined && lv.eggRatePerPiece !== '' ? Number(lv.eggRatePerPiece) : undefined,
    purchaseCost: lv.purchaseCost !== undefined && lv.purchaseCost !== '' ? Number(lv.purchaseCost) : undefined,
    status: lv.status || 'healthy',
    notes: lv.notes ? String(lv.notes) : undefined,
  }));

  const workers: FarmWorker[] = safeArray(data.workers).map((w: any) => ({
    id: String(w.id || ''),
    name: String(w.name || ''),
    phone: w.phone ? String(w.phone) : undefined,
    role: w.role || 'general_labor',
    defaultDailyWage: Number(w.defaultDailyWage) || 0,
    notes: w.notes ? String(w.notes) : undefined,
  }));

  const familyMembers: FamilyMember[] = safeArray(data.familyMembers).map((m: any) => ({
    id: String(m.id || ''),
    name: String(m.name || ''),
    nameTa: String(m.nameTa || m.name || ''),
    relation: m.relation || 'other',
    occupation: m.occupation || 'other',
    occupationTitle: String(m.occupationTitle || ''),
    occupationTitleTa: String(m.occupationTitleTa || ''),
    avatar: m.avatar || '👤',
    color: m.color || '#3B82F6',
    phone: m.phone ? String(m.phone) : undefined,
    monthlySalary: m.monthlySalary !== undefined && m.monthlySalary !== '' ? Number(m.monthlySalary) : undefined,
    notes: m.notes ? String(m.notes) : undefined,
  }));

  return {
    transactions,
    accounts,
    categories,
    budgets,
    goals,
    loans,
    savings,
    fields,
    treeHarvests,
    livestock,
    workers,
    familyMembers,
    settings: data.settings,
  };
}

function checkAndSanitizeUrl(scriptUrl: string): string {
  if (!scriptUrl || !scriptUrl.trim()) {
    throw new Error('Google Apps Script URL is empty.');
  }

  const trimmed = scriptUrl.trim();

  if (trimmed.includes('docs.google.com/spreadsheets')) {
    throw new Error(
      'You entered a Google Spreadsheet document link. Please open Extensions > Apps Script in your spreadsheet, click Deploy > New deployment > Web App, set "Who has access: Anyone", and copy the Web App URL (starts with https://script.google.com/macros/s/.../exec).'
    );
  }

  return trimmed;
}

export const GoogleSheetApiService = {
  /**
   * Test the connection to the Google Apps Script Web App
   */
  testConnection: async (scriptUrl: string): Promise<{ success: boolean; message: string }> => {
    try {
      const cleanUrl = checkAndSanitizeUrl(scriptUrl);
      const url = new URL(cleanUrl);
      url.searchParams.set('action', 'ping');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      let json: SheetApiResponse;
      try {
        json = JSON.parse(text);
      } catch {
        if (text.includes('accounts.google.com') || text.includes('Sign in') || text.includes('ServiceLogin')) {
          return {
            success: false,
            message: 'Access Denied: The Google Apps Script Web App is not public. Please redeploy with "Who has access: Anyone".',
          };
        }
        return {
          success: false,
          message: 'Google Apps Script returned an invalid response. Please ensure you deployed the latest Code.gs script as a Web App.',
        };
      }

      if (json.status === 'success') {
        return { success: true, message: json.message || 'Connected to Google Sheet successfully!' };
      } else {
        return { success: false, message: json.message || 'Error reported by Google Apps Script.' };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to connect. Please check URL and ensure Web App permissions are set to "Anyone".',
      };
    }
  },

  /**
   * Fetch all data from Google Sheet
   */
  fetchAllData: async (scriptUrl: string): Promise<SheetApiResponse<SheetFullPayload>> => {
    const cleanUrl = checkAndSanitizeUrl(scriptUrl);
    const url = new URL(cleanUrl);
    url.searchParams.set('action', 'getAll');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    let json: SheetApiResponse<SheetFullPayload>;
    try {
      json = JSON.parse(text);
    } catch {
      if (text.includes('accounts.google.com') || text.includes('Sign in') || text.includes('ServiceLogin')) {
        throw new Error('Google Apps Script permission denied. Please deploy with "Who has access: Anyone".');
      }
      throw new Error('Google Sheet response was not valid JSON.');
    }

    if (json.status === 'error') {
      throw new Error(json.message || 'Failed to fetch data from Google Sheet.');
    }

    if (json.data) {
      json.data = normalizePayload(json.data);
    }

    return json;
  },

  /**
   * Sync full local database to Google Sheet
   */
  syncAllToSheet: async (scriptUrl: string, payload: SheetFullPayload): Promise<SheetApiResponse> => {
    const cleanUrl = checkAndSanitizeUrl(scriptUrl);

    // Ensure settings is always formatted as an array of { key, value, updatedAt } for Google Sheet
    let settingsArray: any[] = [];
    if (Array.isArray(payload.settings)) {
      settingsArray = payload.settings;
    } else if (payload.settings && typeof payload.settings === 'object') {
      settingsArray = Object.entries(payload.settings).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''),
        updatedAt: new Date().toISOString(),
      }));
    }

    const bodyData = {
      action: 'syncAll',
      payload: {
        transactions: Array.isArray(payload.transactions) ? payload.transactions : [],
        familyMembers: Array.isArray(payload.familyMembers) ? payload.familyMembers : [],
        fields: Array.isArray(payload.fields) ? payload.fields : [],
        treeHarvests: Array.isArray(payload.treeHarvests) ? payload.treeHarvests : [],
        livestock: Array.isArray(payload.livestock) ? payload.livestock : [],
        workers: Array.isArray(payload.workers) ? payload.workers : [],
        categories: Array.isArray(payload.categories) ? payload.categories : [],
        accounts: Array.isArray(payload.accounts) ? payload.accounts : [],
        budgets: Array.isArray(payload.budgets) ? payload.budgets : [],
        goals: Array.isArray(payload.goals) ? payload.goals : [],
        loans: Array.isArray(payload.loans) ? payload.loans : [],
        savings: Array.isArray(payload.savings) ? payload.savings : [],
        settings: settingsArray,
      },
    };

    // Use text/plain to prevent CORS preflight OPTIONS rejection on Google Apps Script
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    let json: SheetApiResponse;
    try {
      json = JSON.parse(text);
    } catch {
      if (text.includes('accounts.google.com') || text.includes('Sign in') || text.includes('ServiceLogin')) {
        throw new Error('Google Apps Script permission denied. Please deploy with "Who has access: Anyone".');
      }
      throw new Error('Google Sheet did not return valid JSON output.');
    }

    if (json.status === 'error') {
      throw new Error(json.message || 'Error occurred while saving data to Google Sheet.');
    }

    return json;
  },

  /**
   * Add a single transaction to Google Sheet
   */
  addTransaction: async (scriptUrl: string, transaction: Transaction): Promise<SheetApiResponse> => {
    if (!scriptUrl || !scriptUrl.trim()) {
      return { status: 'success', message: 'Saved locally' };
    }

    const cleanUrl = checkAndSanitizeUrl(scriptUrl);
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'addTransaction', payload: transaction }),
    });

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { status: 'success', message: 'Transaction dispatched' };
    }
  },

  /**
   * Update a transaction in Google Sheet
   */
  updateTransaction: async (scriptUrl: string, transactionId: string, transaction: Partial<Transaction>): Promise<SheetApiResponse> => {
    if (!scriptUrl || !scriptUrl.trim()) {
      return { status: 'success', message: 'Updated locally' };
    }

    const cleanUrl = checkAndSanitizeUrl(scriptUrl);
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'updateTransaction', payload: { id: transactionId, ...transaction } }),
    });

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { status: 'success', message: 'Update dispatched' };
    }
  },

  /**
   * Delete a transaction from Google Sheet
   */
  deleteTransaction: async (scriptUrl: string, transactionId: string): Promise<SheetApiResponse> => {
    if (!scriptUrl || !scriptUrl.trim()) {
      return { status: 'success', message: 'Deleted locally' };
    }

    const cleanUrl = checkAndSanitizeUrl(scriptUrl);
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'deleteTransaction', payload: { id: transactionId } }),
    });

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { status: 'success', message: 'Deletion dispatched' };
    }
  },
};

