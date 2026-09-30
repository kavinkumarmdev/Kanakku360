import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { Bot, Send, User, Sparkles, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  cards?: SummaryCard[];
}

interface SummaryCard {
  label: string;
  value: string;
  icon: string;
  color: string;
}

// ─────────────────────────────────────────────
// BUILD AI CONTEXT FROM FINANCE DATA
// ─────────────────────────────────────────────
function buildAIContext(ctx: ReturnType<typeof useFinance>) {
  const {
    transactions, accounts, loans, savings, goals, budgets,
    fields, livestock, workers, familyMembers,
    totalNetWorth, totalIncomeThisMonth, totalExpenseThisMonth,
    netSavingsThisMonth, totalLoanLiability, totalSavingsInvested,
    totalChitFundsValue, totalPendingWages,
    totalAnimalCount, totalDailyMilkLiters, totalFarmExpense,
    totalCropIncome, totalTreeHarvestIncome, totalMilkSalesIncome,
    settings,
  } = ctx;

  const currency = settings.currency;
  const fmt = (n: number) => formatCurrency(n, currency);
  const now = new Date();

  const monthTx = transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const activeLoans = loans.filter(l => l.status === 'active');
  const activeSavings = savings.filter(s => s.status === 'active');

  const topExpCat = (() => {
    const m: Record<string, number> = {};
    monthTx.filter(t => t.type === 'expense').forEach(t => {
      m[t.category] = (m[t.category] || 0) + t.amount;
    });
    const top = Object.entries(m).sort((a, b) => b[1] - a[1])[0];
    return top ? `${top[0]} (${fmt(top[1])})` : 'None';
  })();

  return {
    fmt, currency,
    totalNetWorth, totalIncomeThisMonth, totalExpenseThisMonth,
    netSavingsThisMonth, totalLoanLiability, totalSavingsInvested,
    totalChitFundsValue, totalPendingWages,
    totalAnimalCount, totalDailyMilkLiters, totalFarmExpense,
    totalCropIncome, totalTreeHarvestIncome, totalMilkSalesIncome,
    totalBalance, activeLoans, activeSavings,
    accounts, loans, savings, goals, budgets,
    fields, livestock, workers, familyMembers,
    transactions, monthTx, topExpCat,
    userName: settings.userName || 'Kavin',
  };
}

// ─────────────────────────────────────────────
// AI RESPONSE ENGINE
// ─────────────────────────────────────────────
function generateAIResponse(
  input: string,
  ctx: ReturnType<typeof buildAIContext>
): { text: string; cards?: SummaryCard[] } {
  const q = input.toLowerCase().trim();
  const {
    fmt, totalNetWorth, totalIncomeThisMonth, totalExpenseThisMonth,
    netSavingsThisMonth, totalLoanLiability, totalSavingsInvested,
    totalChitFundsValue, totalPendingWages, totalAnimalCount,
    totalDailyMilkLiters, totalFarmExpense, totalCropIncome,
    totalTreeHarvestIncome, totalMilkSalesIncome, totalBalance,
    activeLoans, activeSavings, accounts,
    goals, budgets, fields, livestock, workers, familyMembers,
    transactions, monthTx, topExpCat, userName,
  } = ctx;

  // GREETING
  if (/^(hi|hello|hey|வணக்கம்|hai|helo|start|help)/.test(q)) {
    return {
      text: `👋 வணக்கம் ${userName}! I'm your **Kanakku360 AI Assistant**.\n\nI can help you with:\n• 💰 Account balances & net worth\n• 📊 Income, expenses & savings\n• 🏦 Loans & EMI details\n• 🪙 Chit fund & savings schemes\n• 🌾 Farm, crop & livestock data\n• 📈 Budget & goal tracking\n\nAsk me anything! Try: *"What is my net worth?"* or *"Show my loans"*`,
    };
  }

  // NET WORTH
  if (/net.?worth|total.?wealth|மொத்த சொத்து|overall wealth|total assets/.test(q)) {
    return {
      text: `📊 **Your Financial Overview**\n\nHere's your complete wealth summary:`,
      cards: [
        { label: 'Net Worth',      value: fmt(totalNetWorth),                           icon: '💎', color: 'emerald' },
        { label: 'Cash & Bank',    value: fmt(totalBalance),                             icon: '🏦', color: 'indigo' },
        { label: 'Loan Liability', value: fmt(totalLoanLiability),                       icon: '⚠️', color: 'rose' },
        { label: 'Savings Pool',   value: fmt(totalSavingsInvested + totalChitFundsValue), icon: '🪙', color: 'amber' },
      ],
    };
  }

  // INCOME
  if (/income|வருமானம்|earning|incom/.test(q)) {
    return {
      text: `💚 **This Month's Income**\n\nTotal: **${fmt(totalIncomeThisMonth)}**\n\n• 🌾 Crop Income: ${fmt(totalCropIncome)}\n• 🥛 Milk Sales: ${fmt(totalMilkSalesIncome)}\n• 🌳 Tree Harvest: ${fmt(totalTreeHarvestIncome)}\n• 💼 Other: ${fmt(Math.max(0, totalIncomeThisMonth - totalCropIncome - totalMilkSalesIncome - totalTreeHarvestIncome))}\n\n${totalIncomeThisMonth > totalExpenseThisMonth ? '✅ Earning more than spending this month!' : '⚠️ Expenses exceed income — review your spending.'}`,
      cards: [
        { label: 'Total Income',  value: fmt(totalIncomeThisMonth), icon: '📈', color: 'emerald' },
        { label: 'Net Savings',   value: fmt(netSavingsThisMonth),  icon: '💰', color: netSavingsThisMonth >= 0 ? 'emerald' : 'rose' },
      ],
    };
  }

  // EXPENSE
  if (/expense|செலவு|spend|spending|cost/.test(q)) {
    return {
      text: `🔴 **This Month's Expenses**\n\nTotal: **${fmt(totalExpenseThisMonth)}**\n\n• 🌾 Farm Expenses: ${fmt(totalFarmExpense)}\n• 👷 Pending Wages: ${fmt(totalPendingWages)}\n• 🏷️ Top Category: ${topExpCat}\n\n${totalExpenseThisMonth > totalIncomeThisMonth ? '⚠️ Spending more than earning. Consider reviewing non-essential costs.' : '✅ Spending is within income — great discipline!'}`,
      cards: [
        { label: 'Total Expenses', value: fmt(totalExpenseThisMonth), icon: '📉', color: 'rose' },
        { label: 'Farm Costs',     value: fmt(totalFarmExpense),       icon: '🌾', color: 'amber' },
      ],
    };
  }

  // BALANCE / ACCOUNTS
  if (/balance|account|bank|cash|saving/.test(q) && !/chit|சீட்டு|scheme/.test(q)) {
    const accList = accounts.map(a => `• ${a.icon} **${a.name}** (${a.type}): ${fmt(a.balance)}`).join('\n');
    return {
      text: `🏦 **Account Balances**\n\n${accList}\n\n**Total: ${fmt(totalBalance)}**\n\n💡 Keep at least ${fmt(totalExpenseThisMonth * 3)} as 3-month emergency fund.`,
      cards: accounts.slice(0, 4).map(a => ({ label: a.name, value: fmt(a.balance), icon: a.icon || '🏦', color: 'indigo' })),
    };
  }

  // LOANS
  if (/loan|கடன்|emi|debt|borrow/.test(q)) {
    if (activeLoans.length === 0) {
      return { text: `🎉 **No Active Loans!**\n\nYou are completely **debt-free** — excellent position!` };
    }
    const loanList = activeLoans.map(l =>
      `• **${l.name}** — ${fmt(l.principalAmount)}\n  From: ${l.lenderBorrower} | EMI: ${l.emiAmount ? fmt(l.emiAmount) : 'Not set'} | Rate: ${l.interestRate}%`
    ).join('\n\n');
    return {
      text: `🏦 **Active Loans (${activeLoans.length})**\n\n${loanList}\n\n**Total Outstanding: ${fmt(totalLoanLiability)}**\n\n💡 Pay extra EMI when possible to reduce interest.`,
      cards: [
        { label: 'Total Liability', value: fmt(totalLoanLiability), icon: '🏦', color: 'rose' },
        { label: 'Active Loans',    value: `${activeLoans.length}`, icon: '📋', color: 'amber' },
      ],
    };
  }

  // CHIT FUNDS / SAVINGS SCHEMES
  if (/chit|சீட்டு|scheme|fund/.test(q)) {
    if (activeSavings.length === 0) {
      return { text: `ℹ️ No active chit funds or savings schemes yet.\n\nGo to **Loans & Savings** tab to add one!` };
    }
    const list = activeSavings.map(s => {
      const paid = (s.installments || []).length;
      const pct = Math.round((paid / s.totalInstallments) * 100);
      return `• **${s.name}** (${s.institution})\n  Value: ${fmt(s.totalValue)} | ${paid}/${s.totalInstallments} installments | ${pct}% done`;
    }).join('\n\n');
    return {
      text: `🪙 **Chit Funds & Savings Schemes (${activeSavings.length})**\n\n${list}\n\n**Total Invested: ${fmt(totalSavingsInvested + totalChitFundsValue)}**`,
      cards: [
        { label: 'Chit Value',    value: fmt(totalChitFundsValue), icon: '🪙', color: 'teal' },
        { label: 'Schemes Active', value: `${activeSavings.length}`, icon: '📄', color: 'indigo' },
      ],
    };
  }

  // FARM
  if (/farm|பண்ணை|field|plot|crop|acre/.test(q)) {
    const fieldList = fields.map(f => {
      const crops = (f.crops || []).filter(c => c.status === 'active').map(c => c.cropType).join(', ');
      return `• **${f.name}** — ${f.areaAcre} ${f.sizeUnit || 'acres'} | Crops: ${crops || 'None'}`;
    }).join('\n');
    return {
      text: `🌾 **Farm Overview**\n\n${fieldList || 'No farm fields recorded yet.'}\n\n• 🌱 Crop Income: ${fmt(totalCropIncome)}\n• 🌳 Tree Harvest: ${fmt(totalTreeHarvestIncome)}\n• 💸 Farm Expenses: ${fmt(totalFarmExpense)}\n• **Net Farm Profit: ${fmt(totalCropIncome + totalTreeHarvestIncome - totalFarmExpense)}**`,
      cards: [
        { label: 'Fields',      value: `${fields.length} plots`,                                         icon: '🌾', color: 'emerald' },
        { label: 'Crop Income', value: fmt(totalCropIncome),                                             icon: '🌱', color: 'teal' },
        { label: 'Farm Cost',   value: fmt(totalFarmExpense),                                            icon: '💸', color: 'amber' },
        { label: 'Net Profit',  value: fmt(totalCropIncome + totalTreeHarvestIncome - totalFarmExpense), icon: '📈', color: 'emerald' },
      ],
    };
  }

  // LIVESTOCK
  if (/animal|livestock|கால்நடை|cow|sheep|goat|hen|milk|பால்/.test(q)) {
    const list = livestock.map(a => `• **${a.name}** (${a.type}) — ${a.count} animals`).join('\n');
    return {
      text: `🐄 **Livestock Summary**\n\n${list || 'No livestock recorded.'}\n\n• Total Animals: ${totalAnimalCount}\n• Daily Milk: ${totalDailyMilkLiters.toFixed(1)} liters/day\n• Milk Income: ${fmt(totalMilkSalesIncome)}`,
      cards: [
        { label: 'Animals',     value: `${totalAnimalCount}`,              icon: '🐄', color: 'amber' },
        { label: 'Daily Milk',  value: `${totalDailyMilkLiters.toFixed(1)} L`, icon: '🥛', color: 'teal' },
        { label: 'Milk Income', value: fmt(totalMilkSalesIncome),          icon: '💰', color: 'emerald' },
      ],
    };
  }

  // WORKERS / WAGES
  if (/worker|கூலி|labour|labor|wage|ஊதியம்|pending/.test(q)) {
    const list = workers.map(w => `• **${w.name}** — ₹${w.defaultDailyWage || 0}/day`).join('\n');
    return {
      text: `👷 **Workers & Wages**\n\n${list || 'No workers added yet.'}\n\n⚠️ **Pending Wages: ${fmt(totalPendingWages)}**\n\nSettle in the **Farm & Labor** tab.`,
      cards: [
        { label: 'Workers',       value: `${workers.length}`,    icon: '👷', color: 'indigo' },
        { label: 'Pending Wages', value: fmt(totalPendingWages), icon: '⚠️', color: 'amber' },
      ],
    };
  }

  // GOALS
  if (/goal|இலக்கு|target|saving goal/.test(q)) {
    if (goals.length === 0) {
      return { text: `ℹ️ No savings goals set yet.\n\nGo to **Savings Goals** tab to add your first goal!` };
    }
    const list = goals.map(g => {
      const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
      return `• ${g.icon} **${g.name}**: ${fmt(g.currentAmount)} / ${fmt(g.targetAmount)} (${pct}%)`;
    }).join('\n');
    return { text: `🎯 **Savings Goals**\n\n${list}` };
  }

  // BUDGET
  if (/budget|பட்ஜெட்|limit|spending limit/.test(q)) {
    if (budgets.length === 0) {
      return { text: `ℹ️ No budgets configured yet.\n\nGo to **Budgets & Limits** to set monthly spending limits!` };
    }
    const list = budgets.map(b => `• **${b.categoryName}**: ₹${b.monthlyLimit.toLocaleString()}/month`).join('\n');
    return { text: `📊 **Your Budgets**\n\n${list}` };
  }

  // FULL SUMMARY / REPORT
  if (/summary|report|overview|full|all|complete|show me everything/.test(q)) {
    return {
      text: `📋 **Full Financial Summary — ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}**\n\n**💰 This Month**\n• Income: ${fmt(totalIncomeThisMonth)}\n• Expenses: ${fmt(totalExpenseThisMonth)}\n• Net Savings: ${fmt(netSavingsThisMonth)}\n\n**🏦 Assets**\n• Cash & Bank: ${fmt(totalBalance)}\n• Savings / Chits: ${fmt(totalSavingsInvested + totalChitFundsValue)}\n\n**⚠️ Liabilities**\n• Total Loans: ${fmt(totalLoanLiability)}\n• Pending Wages: ${fmt(totalPendingWages)}\n\n**🌾 Farm**\n• Crop Income: ${fmt(totalCropIncome)}\n• Farm Expenses: ${fmt(totalFarmExpense)}\n• Animals: ${totalAnimalCount} | Milk: ${totalDailyMilkLiters.toFixed(1)} L/day\n\n**💎 Net Worth: ${fmt(totalNetWorth)}**`,
      cards: [
        { label: 'Net Worth',    value: fmt(totalNetWorth),          icon: '💎', color: 'emerald' },
        { label: 'Monthly In',  value: fmt(totalIncomeThisMonth),    icon: '📈', color: 'teal' },
        { label: 'Monthly Out', value: fmt(totalExpenseThisMonth),   icon: '📉', color: 'rose' },
        { label: 'Loans',       value: fmt(totalLoanLiability),      icon: '🏦', color: 'amber' },
      ],
    };
  }

  // TRANSACTION COUNT
  if (/transaction|பரிவர்த்தனை|how many|count|record/.test(q)) {
    return {
      text: `📊 **Transaction Records**\n\n• Total Records: **${transactions.length}**\n• Income Entries: ${transactions.filter(t => t.type === 'income').length}\n• Expense Entries: ${transactions.filter(t => t.type === 'expense').length}\n• This Month: ${monthTx.length} transactions`,
    };
  }

  // ADVICE
  if (/advice|tip|suggest|plan|improve|better|help me/.test(q)) {
    const tips: string[] = [];
    if (totalLoanLiability > totalBalance * 2) tips.push('⚠️ Your loan amount is very high vs. cash. Pay extra EMI when possible.');
    if (totalPendingWages > 0) tips.push(`⚠️ ${fmt(totalPendingWages)} in pending worker wages. Settle soon to maintain trust.`);
    if (netSavingsThisMonth < 0) tips.push('⚠️ Spending more than earning this month. Review non-essential expenses.');
    if (goals.length === 0) tips.push('💡 Set savings goals in the Goals tab to stay motivated.');
    if (budgets.length === 0) tips.push('💡 Add budgets for categories like farm inputs to control spending.');
    if (activeSavings.length > 0) tips.push(`✅ You have ${activeSavings.length} active chit fund(s) — stay consistent with payments!`);
    if (totalAnimalCount > 0 && totalMilkSalesIncome === 0) tips.push('💡 You have livestock but no milk income recorded. Log milk sales regularly!');
    if (tips.length === 0) tips.push('✅ Your finances look healthy! Keep maintaining consistent records for better insights.');
    return { text: `💡 **Financial Advice**\n\n${tips.join('\n\n')}` };
  }

  // FAMILY
  if (/family|குடும்பம்|member|who|people/.test(q)) {
    const list = familyMembers.map(m => `• ${m.avatar} **${m.name}** — ${m.occupationTitle}`).join('\n');
    return { text: `👨‍👩‍👧‍👦 **Family Members**\n\n${list || 'No family members added yet.'}` };
  }

  // FALLBACK
  return {
    text: `🤔 I didn't understand that. Here are some things you can ask:\n\n• *"What is my net worth?"*\n• *"Show my income this month"*\n• *"How much loan do I have?"*\n• *"Show chit fund details"*\n• *"Farm summary"*\n• *"Give me financial advice"*\n• *"Full summary report"*`,
  };
}

// ─────────────────────────────────────────────
// MARKDOWN RENDERER (bold + newlines)
// ─────────────────────────────────────────────
function RenderMarkdown({ text }: { text: string }) {
  return (
    <div className="space-y-1 leading-relaxed">
      {text.split('\n').map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className={line === '' ? 'h-1.5' : ''}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j} className="font-bold text-white">{part.slice(2, -2)}</strong>
                : <span key={j}>{part}</span>
            )}
          </p>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// SUMMARY CARD
// ─────────────────────────────────────────────
const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300',
  indigo:  'bg-indigo-950/60 border-indigo-500/30 text-indigo-300',
  rose:    'bg-rose-950/60 border-rose-500/30 text-rose-300',
  amber:   'bg-amber-950/60 border-amber-500/30 text-amber-300',
  teal:    'bg-teal-950/60 border-teal-500/30 text-teal-300',
};

function SummaryCardChip({ card }: { card: SummaryCard }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs ${colorMap[card.color] || colorMap.indigo}`}>
      <span className="text-base leading-none">{card.icon}</span>
      <div>
        <p className="text-[10px] opacity-70 font-medium">{card.label}</p>
        <p className="font-bold text-white text-sm">{card.value}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TYPING INDICATOR
// ─────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-fadeIn">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-lg">
        <Bot size={14} className="text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-slate-800 border border-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// QUICK QUESTION CHIPS
// ─────────────────────────────────────────────
const QUICK_QUESTIONS = [
  { label: '💎 Net Worth',   q: 'What is my net worth?' },
  { label: '📋 Full Report', q: 'Show me full summary report' },
  { label: '💚 Income',      q: 'Show my income this month' },
  { label: '🔴 Expenses',    q: 'Show my expenses this month' },
  { label: '🏦 Loans',       q: 'Show my loan details' },
  { label: '🪙 Chit Funds',  q: 'Show chit fund and savings schemes' },
  { label: '🌾 Farm',        q: 'Give me farm summary' },
  { label: '🐄 Livestock',   q: 'Show livestock and milk details' },
  { label: '👷 Wages',       q: 'Show worker wages and pending amount' },
  { label: '💡 Advice',      q: 'Give me financial advice' },
];

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export const AIAssistant: React.FC = () => {
  const financeCtx = useFinance();
  const aiCtx = buildAIContext(financeCtx);

  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    role: 'ai',
    text: `👋 வணக்கம் ${aiCtx.userName}! I'm your **Kanakku360 AI Assistant**.\n\nI can read all your financial data and answer questions in natural language. Ask me about balances, loans, farm income, chit funds, or get a full summary!\n\nTry one of the quick buttons below or type your own question 🤖`,
    timestamp: new Date(),
  }]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    const q = text.trim();
    if (!q) return;

    setMessages(prev => [...prev, {
      id: `u_${Date.now()}`, role: 'user', text: q, timestamp: new Date(),
    }]);
    setInputText('');
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 600 + Math.random() * 500));

    const resp = generateAIResponse(q, aiCtx);
    setIsTyping(false);
    setMessages(prev => [...prev, {
      id: `ai_${Date.now()}`, role: 'ai', text: resp.text, timestamp: new Date(), cards: resp.cards,
    }]);
  };

  const handleClear = () => {
    setMessages([{
      id: 'clear', role: 'ai',
      text: `🔄 Chat cleared! Ask me anything, ${aiCtx.userName}.`,
      timestamp: new Date(),
    }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[900px] min-h-[500px]">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              Kanakku360 AI
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold animate-pulse">
                LIVE DATA
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Your personal finance AI — powered by your own data</p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60 transition cursor-pointer"
        >
          <RefreshCw size={12} />
          <span>Clear</span>
        </button>
      </div>

      {/* Quick question chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-1 shrink-0" style={{ scrollbarWidth: 'none' }}>
        {QUICK_QUESTIONS.map(q => (
          <button
            key={q.q}
            onClick={() => sendMessage(q.q)}
            disabled={isTyping}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 hover:border-emerald-500/40 text-xs text-slate-300 hover:text-white whitespace-nowrap transition shrink-0 cursor-pointer disabled:opacity-50"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 min-h-0 pr-0.5">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 animate-fadeIn ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-md ${
              msg.role === 'ai'
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                : 'bg-gradient-to-br from-indigo-600 to-purple-600'
            }`}>
              {msg.role === 'ai'
                ? <Bot size={13} className="text-white" />
                : <User size={13} className="text-white" />}
            </div>

            {/* Bubble + cards */}
            <div className={`flex flex-col gap-2 max-w-[82%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-bl-sm'
              }`}>
                {msg.role === 'ai'
                  ? <RenderMarkdown text={msg.text} />
                  : <span>{msg.text}</span>}
              </div>

              {msg.cards && msg.cards.length > 0 && (
                <div className="grid grid-cols-2 gap-2 w-full">
                  {msg.cards.map((card, ci) => <SummaryCardChip key={ci} card={card} />)}
                </div>
              )}

              <span className="text-[10px] text-slate-500 px-1">
                {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 pt-3 border-t border-slate-800">
        <form
          onSubmit={e => { e.preventDefault(); sendMessage(inputText); }}
          className="flex items-center gap-2"
        >
          <div className="flex-1 relative">
            <Sparkles size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/50 pointer-events-none" />
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask anything about your finances..."
              disabled={isTyping}
              autoFocus
              className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-emerald-500/60 text-sm text-white placeholder-slate-500 focus:outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 transition shrink-0 cursor-pointer"
          >
            <Send size={16} />
          </button>
        </form>
        <p className="text-[10px] text-slate-600 text-center mt-2">
          AI reads your live local data — no internet needed
        </p>
      </div>
    </div>
  );
};
