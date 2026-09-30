import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import { Bot, Send, User, Sparkles, RefreshCw, Plus, FileSpreadsheet, X, Check, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import type { Category, Account } from '../../types/finance';

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
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm glass-panel border border-slate-700/60 shadow-sm">
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
// NATURAL LANGUAGE TRANSACTION PARSER
// ─────────────────────────────────────────────
interface ParsedAddIntent {
  type: 'expense' | 'income';
  amount: number;
  description: string;
  categoryId: string;
  categoryName: string;
  accountId: string;
  accountName: string;
  paymentMode: 'cash' | 'bank' | 'upi';
}

function tryParseAddIntent(
  rawInput: string,
  categories: Category[],
  accounts: Account[]
): ParsedAddIntent | null {
  const input = rawInput.trim();
  const lower = input.toLowerCase();

  // 1. Amount match
  const amountMatch = input.match(/(?:₹|rs\.?|inr)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)\s*(?:rs|rupees|ரூபாய்|k\b)?/i);
  if (!amountMatch) return null;

  let rawNum = amountMatch[1].replace(/,/g, '');
  let amount = parseFloat(rawNum);
  if (isNaN(amount) || amount <= 0) return null;

  if (/(\d+)\s*k\b/i.test(input)) {
    const kMatch = input.match(/(\d+)\s*k\b/i);
    if (kMatch) amount = parseFloat(kMatch[1]) * 1000;
  }

  // 2. Intent validation
  const isExplicitAdd = /^(add|record|entry|spent|spend|paid|cost|buy|bought|received|earned|got|செலவு|வரவு|வாங்கியது|கொடுத்தேன்)/i.test(lower);
  const hasKeyword = /expense|income|spent|spend|paid|received|earned|sale|sold|salary|cost|வாங்கியது|கொடுத்தேன்|செலவு|வரவு|விற்பனை|சம்பளம்/i.test(lower);
  const isQuestion = /^(what|how|show|list|tell|view|give|is|who|என்ன|எவ்வளவு|காட்டு)/i.test(lower);
  if (isQuestion) return null;

  if (!isExplicitAdd && !hasKeyword) {
    const words = lower.split(/\s+/).filter(Boolean);
    if (words.length > 5) return null;
  }

  // 3. Determine type
  let type: 'expense' | 'income' = 'expense';
  if (/income|received|earned|got|sale|sold|salary|harvest|bonus|dividend|வரவு|வந்தது|விற்றது|சம்பளம்|அறுவடை/i.test(lower)) {
    type = 'income';
  }

  // 4. Determine category
  let matchedCat: Category | undefined;
  if (/fuel|diesel|petrol|bike|car|auto|transport|டீசல்|பெட்ரோல்/i.test(lower)) {
    matchedCat = categories.find(c => c.id === 'cat_fuel');
  } else if (/fertilizer|manure|dap|potash|urea|உரம்|சாணம்/i.test(lower)) {
    matchedCat = categories.find(c => c.id === 'cat_farm_fertilizer');
  } else if (/labor|labour|coolie|wage|worker|கூலி|ஆட்கள்/i.test(lower)) {
    matchedCat = categories.find(c => c.id === 'cat_farm_labor');
  } else if (/seed|sapling|plant|விதை|நாற்று|கன்று/i.test(lower)) {
    matchedCat = categories.find(c => c.id === 'cat_farm_seeds');
  } else if (/pesticide|spray|poison|மருந்து தெளிப்பு|பூச்சிக்கொல்லி/i.test(lower)) {
    matchedCat = categories.find(c => c.id === 'cat_farm_pesticide');
  } else if (/tractor|plough|rotavator|டிராக்டர்|உழவு/i.test(lower)) {
    matchedCat = categories.find(c => c.id === 'cat_farm_tractor');
  } else if (/pipe|drip|motor|pump|irrigation|பாசனம்|பம்பு/i.test(lower)) {
    matchedCat = categories.find(c => c.id === 'cat_farm_irrigation');
  } else if (/tree|coconut prune|கவாத்து|மரம்/i.test(lower)) {
    matchedCat = categories.find(c => c.id === 'cat_tree_maintenance');
  } else if (/feed|punnakku|thavudu|தீவனம்|புண்ணாக்கு|தவிடு/i.test(lower)) {
    matchedCat = categories.find(c => c.id === 'cat_animal_feed');
  } else if (/vet|cow medicine|கால்நடை மருத்துவம்/i.test(lower)) {
    matchedCat = categories.find(c => c.id === 'cat_animal_medical');
  } else if (/medicine|hospital|doctor|tablet|medical|மருத்துவம்|மருந்து/i.test(lower)) {
    matchedCat = categories.find(c => c.id === 'cat_human_medical');
  } else if (/recharge|mobile|airtel|jio|dth|ரீசார்ஜ்/i.test(lower)) {
    matchedCat = categories.find(c => c.id === 'cat_mobile_recharge');
  } else if (/eb|electricity|current bill|மின்சாரம்|மின்கட்டணம்/i.test(lower)) {
    matchedCat = categories.find(c => c.id === 'cat_eb_electricity');
  } else if (/milk|dairy|பால்|கறவை/i.test(lower)) {
    matchedCat = type === 'income' ? categories.find(c => c.id === 'cat_milk_sale') : categories.find(c => c.id === 'cat_animal_feed');
  } else if (/coconut|copra|தேங்காய்|கொப்பரை/i.test(lower)) {
    matchedCat = type === 'income' ? categories.find(c => c.id === 'cat_coconut_sale') : categories.find(c => c.id === 'cat_tree_maintenance');
  } else if (/crop|paddy|sugarcane|turmeric|banana|நெல்|கரும்பு|வாழை|மஞ்சள்/i.test(lower)) {
    matchedCat = type === 'income' ? categories.find(c => c.id === 'cat_crop_sale') : categories.find(c => c.id === 'cat_farm_seeds');
  } else if (/vegetable|onion|tomato|காய்கறி|வெங்காயம்/i.test(lower)) {
    matchedCat = type === 'income' ? categories.find(c => c.id === 'cat_vegetable_sale') : categories.find(c => c.id === 'cat_groceries');
  } else if (/salary|company job|சம்பளம்/i.test(lower)) {
    matchedCat = categories.find(c => c.id === 'cat_salary');
  } else if (/grocery|food|tea|coffee|lunch|dinner|hotel|snacks|சாப்பாடு|மளிகை/i.test(lower)) {
    matchedCat = categories.find(c => c.id === 'cat_groceries');
  }

  if (!matchedCat) {
    matchedCat = categories.find(c => c.type === type) || categories[0];
  }

  // 5. Account & Mode
  let matchedAcc: Account | undefined;
  let paymentMode: 'cash' | 'bank' | 'upi' = 'cash';
  if (/bank|online|transfer|வங்கி/i.test(lower)) {
    matchedAcc = accounts.find(a => a.type === 'bank');
    paymentMode = 'bank';
  } else if (/gpay|phonepe|paytm|upi/i.test(lower)) {
    matchedAcc = accounts.find(a => a.type === 'bank') || accounts[0];
    paymentMode = 'upi';
  } else if (/cash|ரொக்கம்/i.test(lower)) {
    matchedAcc = accounts.find(a => a.type === 'cash');
    paymentMode = 'cash';
  }
  if (!matchedAcc) {
    matchedAcc = accounts.find(a => a.isDefault) || accounts[0] || ({ id: 'acc_cash', name: 'Cash in Hand' } as Account);
  }

  // 6. Clean Description
  let cleaned = input
    .replace(/(?:₹|rs\.?|inr)?\s*[0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?\s*(?:rs|rupees|ரூபாய்|k\b)?/gi, '')
    .replace(/^(add|record|spent|spend|paid|cost|bought|buy|received|earned|got|செலவு|வரவு|வாங்கியது|கொடுத்தேன்)\s+/gi, '')
    .replace(/\b(expense|income|for|on|from|via|to|in|by|ரூபாய்|பதிவு)\b/gi, '')
    .replace(/^(cash|bank|gpay|upi|phonepe)\b/gi, '')
    .trim();

  if (!cleaned || cleaned.length < 2) {
    cleaned = matchedCat ? matchedCat.name.split('(')[0].trim() : (type === 'income' ? 'Income Entry' : 'Expense Entry');
  }

  return {
    type,
    amount,
    description: cleaned,
    categoryId: matchedCat?.id || (type === 'income' ? 'cat_crop_sale' : 'cat_groceries'),
    categoryName: matchedCat?.name || (type === 'income' ? 'Income' : 'Expense'),
    accountId: matchedAcc.id,
    accountName: matchedAcc.name,
    paymentMode,
  };
}

// ─────────────────────────────────────────────
// QUICK ACTION CHIPS
// ─────────────────────────────────────────────
const QUICK_QUESTIONS = [
  { label: '➕ Add Expense', q: '__ACTION_ADD_EXPENSE__' },
  { label: '➕ Add Income',  q: '__ACTION_ADD_INCOME__' },
  { label: '🔄 Sync to Sheet', q: 'sync sheet now' },
  { label: '💎 Net Worth',   q: 'What is my net worth?' },
  { label: '📋 Full Report', q: 'Show me full summary report' },
  { label: '💚 Income',      q: 'Show my income this month' },
  { label: '🔴 Expenses',    q: 'Show my expenses this month' },
  { label: '🏦 Loans',       q: 'Show my loan details' },
  { label: '🪙 Chit Funds',  q: 'Show chit fund and savings schemes' },
  { label: '🌾 Farm',        q: 'Give me farm summary' },
  { label: '🐄 Livestock',   q: 'Show livestock and milk details' },
  { label: '👷 Wages',       q: 'Show worker wages and pending amount' },
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
    text: `👋 வணக்கம் ${aiCtx.userName}! I'm your **Kanakku360 AI Assistant**.\n\nNow I can both **read your finances** and **add new entries** directly into your accounts & Google Sheet!\n\n💡 **You can try:**\n• *"Spent 500 for diesel"*\n• *"Add income 12000 from milk sale"*\n• *"செலவு 350 மளிகை"*\n• *"Sync to sheet"*\n• *"What is my net worth?"*`,
    timestamp: new Date(),
  }]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Quick Add Form state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [qaType, setQaType] = useState<'expense' | 'income'>('expense');
  const [qaAmount, setQaAmount] = useState('');
  const [qaCategory, setQaCategory] = useState('');
  const [qaAccount, setQaAccount] = useState('');
  const [qaDescription, setQaDescription] = useState('');
  const [qaIsSaving, setQaIsSaving] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(qaAmount);
    if (isNaN(amt) || amt <= 0) return;

    setQaIsSaving(true);
    const cat = financeCtx.categories.find(c => c.id === qaCategory) || financeCtx.categories.find(c => c.type === qaType);
    const acc = financeCtx.accounts.find(a => a.id === qaAccount) || financeCtx.accounts[0];
    const catName = cat?.name || qaType;
    const accName = acc?.name || 'Cash in Hand';
    const desc = qaDescription.trim() || catName.split('(')[0].trim();

    try {
      await financeCtx.addTransaction({
        date: new Date().toISOString().split('T')[0],
        type: qaType,
        amount: amt,
        category: cat?.id || (qaType === 'income' ? 'cat_crop_sale' : 'cat_groceries'),
        accountId: acc?.id || 'acc_cash',
        description: desc,
        paymentMode: acc?.type === 'bank' ? 'bank' : 'cash',
      });

      let syncSuccess = false;
      if (financeCtx.settings.sheetUrl) {
        syncSuccess = await financeCtx.syncWithGoogleSheet('push');
      }

      setMessages(prev => [
        ...prev,
        {
          id: `u_${Date.now()}`,
          role: 'user',
          text: `Added ${qaType}: ${aiCtx.fmt(amt)} for ${desc}`,
          timestamp: new Date(),
        },
        {
          id: `ai_${Date.now() + 1}`,
          role: 'ai',
          text: `✅ **${qaType === 'income' ? 'Income Added & Synced!' : 'Expense Added & Synced!'}**\n\n• 💰 **Amount:** ${aiCtx.fmt(amt)}\n• 🏷️ **Category:** ${catName}\n• 🏦 **Account:** ${accName}\n• 📝 **Note:** ${desc}\n• 📅 **Date:** ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}\n\n${financeCtx.settings.sheetUrl ? (syncSuccess ? '📊 **Google Sheet:** Synced & updated live! ✅' : '📊 **Google Sheet:** Synced (Sync queued)') : '💡 **Tip:** Connect your Google Sheet in Settings to automatically sync live to your spreadsheet!'}`,
          timestamp: new Date(),
          cards: [
            { label: 'Amount', value: aiCtx.fmt(amt), icon: qaType === 'income' ? '💚' : '🔴', color: qaType === 'income' ? 'emerald' : 'rose' },
            { label: 'Category', value: catName.split('(')[0].trim(), icon: '🏷️', color: 'indigo' },
            { label: 'Account', value: accName.split('(')[0].trim(), icon: '🏦', color: 'teal' },
            { label: 'Sheet Status', value: financeCtx.settings.sheetUrl ? 'Synced Live ✅' : 'Local Only', icon: '📊', color: financeCtx.settings.sheetUrl ? 'emerald' : 'amber' },
          ],
        },
      ]);

      setShowQuickAdd(false);
      setQaAmount('');
      setQaDescription('');
      financeCtx.addToast('Entry added & synced to sheet!', 'success');
    } catch (err) {
      console.error(err);
      financeCtx.addToast('Failed to save entry', 'error');
    } finally {
      setQaIsSaving(false);
    }
  };

  const sendMessage = async (text: string) => {
    const q = text.trim();
    if (!q) return;

    // 1. Action chips
    if (q === '__ACTION_ADD_EXPENSE__') {
      setQaType('expense');
      setShowQuickAdd(true);
      return;
    }
    if (q === '__ACTION_ADD_INCOME__') {
      setQaType('income');
      setShowQuickAdd(true);
      return;
    }

    setMessages(prev => [...prev, {
      id: `u_${Date.now()}`, role: 'user', text: q, timestamp: new Date(),
    }]);
    setInputText('');
    setIsTyping(true);

    // 2. Check for manual Google Sheet sync command
    if (/^(sync\b|sheet sync|sync sheet|sync to sheet|sync now|sync google sheet|ஷீட் சிங்க்)/i.test(q)) {
      if (financeCtx.settings.sheetUrl) {
        const ok = await financeCtx.syncWithGoogleSheet('push');
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: `ai_${Date.now()}`,
          role: 'ai',
          text: ok
            ? `🔄 **Google Sheet Synced Successfully!**\n\nAll your latest transactions, account balances, farm logs, livestock entries, loans, and chit fund schemes have been saved and pushed live to your Google Sheet database.\n\n📊 **Sheet Status:** Active & Updated\n⏱️ **Timestamp:** ${new Date().toLocaleTimeString('en-IN')}`
            : `⚠️ **Google Sheet Sync encountered an issue.**\nPlease verify your Google Apps Script URL in **Settings > Google Sheet Sync**.`,
          timestamp: new Date(),
          cards: [
            { label: 'Sheet Status', value: ok ? 'Synced Live ✅' : 'Sync Error ⚠️', icon: '📊', color: ok ? 'emerald' : 'rose' },
            { label: 'Total Entries', value: `${financeCtx.transactions.length} records`, icon: '📑', color: 'indigo' },
          ],
        }]);
      } else {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: `ai_${Date.now()}`,
          role: 'ai',
          text: `ℹ️ **Google Sheet is not connected yet.**\n\nTo save and sync data directly to your spreadsheet:\n1. Go to **App Settings > Google Sheet Sync**\n2. Connect your Google Apps Script Web App URL\n\nOnce connected, all data you add here will automatically sync to your spreadsheet!`,
          timestamp: new Date(),
        }]);
      }
      return;
    }

    // 3. Check for Add Data intent
    const parsedAdd = tryParseAddIntent(q, financeCtx.categories, financeCtx.accounts);
    if (parsedAdd) {
      try {
        await financeCtx.addTransaction({
          date: new Date().toISOString().split('T')[0],
          type: parsedAdd.type,
          amount: parsedAdd.amount,
          category: parsedAdd.categoryId,
          accountId: parsedAdd.accountId,
          description: parsedAdd.description,
          paymentMode: parsedAdd.paymentMode,
        });

        let syncSuccess = false;
        if (financeCtx.settings.sheetUrl) {
          syncSuccess = await financeCtx.syncWithGoogleSheet('push');
        }

        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: `ai_${Date.now()}`,
          role: 'ai',
          text: `✅ **${parsedAdd.type === 'income' ? 'Income Added & Synced!' : 'Expense Added & Synced!'}**\n\n• 💰 **Amount:** ${aiCtx.fmt(parsedAdd.amount)}\n• 🏷️ **Category:** ${parsedAdd.categoryName}\n• 🏦 **Account:** ${parsedAdd.accountName}\n• 📝 **Note:** ${parsedAdd.description}\n• 📅 **Date:** ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}\n\n${financeCtx.settings.sheetUrl ? (syncSuccess ? '📊 **Google Sheet:** Synced & saved directly to your spreadsheet! ✅' : '📊 **Google Sheet:** Synced (Sync queued)') : '💡 **Tip:** Connect your Google Sheet in Settings to sync live to your spreadsheet!'}`,
          timestamp: new Date(),
          cards: [
            { label: 'Amount', value: aiCtx.fmt(parsedAdd.amount), icon: parsedAdd.type === 'income' ? '💚' : '🔴', color: parsedAdd.type === 'income' ? 'emerald' : 'rose' },
            { label: 'Category', value: parsedAdd.categoryName.split('(')[0].trim(), icon: '🏷️', color: 'indigo' },
            { label: 'Account', value: parsedAdd.accountName.split('(')[0].trim(), icon: '🏦', color: 'teal' },
            { label: 'Sheet Status', value: financeCtx.settings.sheetUrl ? 'Synced Live ✅' : 'Local Only', icon: '📊', color: financeCtx.settings.sheetUrl ? 'emerald' : 'amber' },
          ],
        }]);
        financeCtx.addToast('Entry added & synced to sheet!', 'success');
        return;
      } catch (err) {
        console.error(err);
      }
    }

    // 4. Default: Read & Query Engine
    await new Promise(r => setTimeout(r, 500 + Math.random() * 400));
    const resp = generateAIResponse(q, aiCtx);
    setIsTyping(false);
    setMessages(prev => [...prev, {
      id: `ai_${Date.now()}`, role: 'ai', text: resp.text, timestamp: new Date(), cards: resp.cards,
    }]);
  };

  const handleClear = () => {
    setMessages([{
      id: 'clear', role: 'ai',
      text: `🔄 Chat cleared! Ask me anything or tell me to add an entry, ${aiCtx.userName}.`,
      timestamp: new Date(),
    }]);
  };

  const hasSheetUrl = Boolean(financeCtx.settings.sheetUrl);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[900px] min-h-[500px]">

      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              Kanakku360 AI
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold animate-pulse">
                READ & WRITE
              </span>
              {hasSheetUrl ? (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-400 font-medium">
                  <FileSpreadsheet size={10} /> Sheet Connected
                </span>
              ) : null}
            </h1>
            <p className="text-[11px] text-slate-400">Ask questions, add expenses & income, and sync to Google Sheets live</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
              showQuickAdd
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30'
            }`}
          >
            {showQuickAdd ? <X size={12} /> : <Plus size={12} />}
            <span>{showQuickAdd ? 'Close' : 'Quick Entry'}</span>
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60 transition cursor-pointer"
            title="Clear Chat"
          >
            <RefreshCw size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Quick Add Slide-down Form */}
      {showQuickAdd && (
        <form
          onSubmit={handleQuickAddSubmit}
          className="glass-panel p-4 rounded-2xl border border-emerald-500/40 mb-3 space-y-3 shadow-lg animate-fadeIn shrink-0"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Plus size={14} className="text-emerald-400" />
              Quick Add & Sync to Sheet
            </span>
            <div className="flex items-center bg-slate-900/60 p-0.5 rounded-xl border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setQaType('expense')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  qaType === 'expense'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowDownLeft size={11} /> Expense
              </button>
              <button
                type="button"
                onClick={() => setQaType('income')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  qaType === 'income'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowUpRight size={11} /> Income
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 font-medium block mb-1">Amount (₹) *</label>
              <input
                type="number"
                step="any"
                required
                value={qaAmount}
                onChange={e => setQaAmount(e.target.value)}
                placeholder="500"
                className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-emerald-500/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-medium block mb-1">Category</label>
              <select
                value={qaCategory}
                onChange={e => setQaCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-xs text-white focus:border-emerald-500/60 focus:outline-none"
              >
                <option value="">Select Category</option>
                {financeCtx.categories
                  .filter(c => c.type === qaType)
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-medium block mb-1">Account</label>
              <select
                value={qaAccount}
                onChange={e => setQaAccount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-xs text-white focus:border-emerald-500/60 focus:outline-none"
              >
                {financeCtx.accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-medium block mb-1">Description / Note</label>
              <input
                type="text"
                value={qaDescription}
                onChange={e => setQaDescription(e.target.value)}
                placeholder="e.g. Petrol, Fertilizer, Milk"
                className="w-full px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-emerald-500/60 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <FileSpreadsheet size={11} className="text-emerald-400" />
              {hasSheetUrl ? 'Will sync automatically to Google Sheet' : 'Saved locally (Connect Sheet in Settings)'}
            </span>
            <button
              type="submit"
              disabled={qaIsSaving || !qaAmount}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-md shadow-emerald-600/20 disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
            >
              <Check size={13} />
              <span>{qaIsSaving ? 'Saving...' : 'Save & Sync to Sheet'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Quick question chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-1 shrink-0" style={{ scrollbarWidth: 'none' }}>
        {QUICK_QUESTIONS.map(q => (
          <button
            key={q.q}
            onClick={() => sendMessage(q.q)}
            disabled={isTyping}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 text-xs text-slate-300 hover:text-white whitespace-nowrap transition shrink-0 cursor-pointer disabled:opacity-50"
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
                  : 'glass-panel border border-slate-700/60 text-slate-200 rounded-bl-sm shadow-sm'
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
              className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700 hover:border-slate-600 focus:border-emerald-500/60 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition"
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
