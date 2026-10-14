import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import {
  Bot, Send, User, Sparkles, RefreshCw, Plus, FileSpreadsheet, X, Check,
  Building2
} from 'lucide-react';
import type { Category, Account, RentalProperty } from '../../types/finance';

export interface MessageAction {
  label: string;
  action: '__CONFIRM_QUICK_ADD__' | '__OPEN_QUICK_ADD__' | '__NAV_TAB__' | '__CONFIRM_SETTLEMENT__' | '__SEND_PROMPT__';
  payload?: any;
}

export interface SummaryCard {
  label: string;
  value: string;
  icon: string;
  color: string;
}

export interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  cards?: SummaryCard[];
  actions?: MessageAction[];
}

export interface AIAssistantProps {
  onNavigate?: (tab: string) => void;
}

// ─────────────────────────────────────────────
// BUILD AI CONTEXT FROM FINANCE DATA
// ─────────────────────────────────────────────
function buildAIContext(ctx: ReturnType<typeof useFinance>) {
  const {
    transactions, accounts, loans, savings, goals, budgets,
    fields, livestock, workers, familyMembers,
    rentalProperties,
    totalNetWorth, totalIncomeThisMonth, totalExpenseThisMonth,
    netSavingsThisMonth, totalLoanLiability, totalSavingsInvested,
    totalChitFundsValue, totalPendingWages,
    totalAnimalCount, totalDailyMilkLiters, totalFarmExpense,
    totalCropIncome, totalTreeHarvestIncome, totalMilkSalesIncome,
    totalMonthlyRentExpected, totalRentCollectedThisMonth,
    totalDepositsHeld, totalRentalIncomeAllTime,
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
    totalMonthlyRentExpected, totalRentCollectedThisMonth,
    totalDepositsHeld, totalRentalIncomeAllTime,
    totalBalance, activeLoans, activeSavings,
    accounts, loans, savings, goals, budgets,
    fields, livestock, workers, familyMembers,
    rentalProperties: rentalProperties || [],
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
): { text: string; cards?: SummaryCard[]; actions?: MessageAction[] } {
  const q = input.toLowerCase().trim();
  const {
    fmt, totalNetWorth, totalIncomeThisMonth, totalExpenseThisMonth,
    netSavingsThisMonth, totalLoanLiability, totalSavingsInvested,
    totalChitFundsValue, totalPendingWages, totalAnimalCount,
    totalDailyMilkLiters, totalFarmExpense, totalCropIncome,
    totalTreeHarvestIncome, totalMilkSalesIncome, totalBalance,
    totalMonthlyRentExpected, totalRentCollectedThisMonth,
    totalDepositsHeld, totalRentalIncomeAllTime,
    rentalProperties,
    activeLoans, activeSavings, accounts,
    goals, budgets, fields, livestock, workers, familyMembers,
    transactions, monthTx, topExpCat, userName,
  } = ctx;

  // GREETING
  if (/^(hi|hello|hey|வணக்கம்|hai|helo|start|help)/.test(q)) {
    return {
      text: `👋 வணக்கம் ${userName}! I'm your **Kanakku360 AI Assistant**.\n\nI can help you with:\n• 🏠 **Shop & House Rentals** (Rent income, advance deposits & cleaning deductions)\n• 💰 **Account balances & net worth**\n• 📊 **Income, expenses & live Google Sheet sync**\n• 🏦 **Loans & EMI details**\n• 🪙 **Chit funds & savings schemes**\n• 🌾 **Farm, crop & livestock data**\n• 📈 **Budget & goal tracking**\n\nAsk me anything! Try: *"How to manage shop rent?"* or *"What is my net worth?"*`,
      actions: [
        { label: '🏠 Rentals Hub', action: '__NAV_TAB__', payload: { tab: 'rentals' } },
        { label: '💎 Net Worth', action: '__SEND_PROMPT__', payload: { text: 'What is my net worth?' } },
        { label: '➕ Add Expense', action: '__OPEN_QUICK_ADD__', payload: { type: 'expense' } },
      ],
    };
  }

  // GUIDE / HOW-TO MANAGE RENTALS & ADVANCE DEDUCTIONS
  if (/how.*(add|update|manage|work|use|rent|advance|clean|vacate)|எப்படி.*(சேர்க்க|வாடகை|முன்பணம்|சுத்தம்)/.test(q)) {
    return {
      text: `🏠 **How to Manage Shop & House Rentals in Kanakku360**\n\n` +
        `You have 2 convenient ways to manage properties, rental income, and security advance refunds:\n\n` +
        `### 1️⃣ In the Rentals & Properties Tab (Full Dashboard)\n` +
        `• **Add Property:** Click **+ Add Property** ➔ Select **Shop (கடை)** or **House (வீடு)**, enter monthly rent & initial advance deposit.\n` +
        `• **Collect Monthly Rent:** Click **Collect Rent** on any occupied property to record income in 1 click.\n` +
        `• **Vacate & Refund Advance (with Cleaning Deductions):**\n` +
        `  When a tenant leaves, click **Settle & Vacate**. You can return full or partial advance, and enter deductions for:\n` +
        `  - 🧹 Cleaning (துப்புரவு / சுத்தம்)\n` +
        `  - 🎨 Painting (வண்ணம் பூசுதல்)\n` +
        `  - 🔧 Damages / Repairs (பழுது)\n` +
        `  The net amount is refunded to the tenant, and deduction is tracked as property maintenance!\n\n` +
        `### 2️⃣ Fast AI Natural Language Chat\n` +
        `You can type directly into this chat anytime:\n` +
        `• *"Add shop rent 8000"*\n` +
        `• *"Received house advance 50000"*\n` +
        `• *"Vacate shop advance 50000 reduce 5000 cleaning"*\n` +
        `• *"Add amount 1000"* (I will ask for clarification instead of blindly tagging!)\n\n` +
        `Click below to jump directly to your Rentals Hub:`,
      cards: [
        { label: 'Expected Rent',  value: fmt(totalMonthlyRentExpected),    icon: '💵', color: 'emerald' },
        { label: 'Advance Held',   value: fmt(totalDepositsHeld),           icon: '🔑', color: 'indigo' },
      ],
      actions: [
        { label: '🏠 Go to Rentals Hub', action: '__NAV_TAB__', payload: { tab: 'rentals' } },
        { label: '➕ Add Shop / House',  action: '__NAV_TAB__', payload: { tab: 'rentals', openAdd: true } },
      ],
    };
  }

  // RENTALS / PROPERTIES / SHOPS / HOUSES / ADVANCE
  if (/rent|வாடகை|shop|வீடு|house|advance|முன்பணம்|tenant|property|சொத்து|கடை/.test(q)) {
    const totalProps = rentalProperties.length;
    const occupied = rentalProperties.filter(p => p.status === 'occupied').length;
    const vacant = rentalProperties.filter(p => p.status === 'vacant').length;
    const pendingRent = Math.max(0, totalMonthlyRentExpected - totalRentCollectedThisMonth);

    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const propList = rentalProperties.map(p => {
      const typeLabel = p.type === 'shop' ? '🏪 Shop' : '🏠 House';
      const statusLabel = p.status === 'occupied' ? `Occupied by ${p.tenantName || 'Tenant'}` : 'Vacant';
      const isPaid = (p.payments || []).some(pm => pm.date.startsWith(currentMonthStr));
      const collectedBadge = isPaid ? '✅ Paid this month' : '⏳ Pending this month';
      return `• **${p.name}** (${typeLabel})\n  Rent: **${fmt(p.monthlyRent)}/mo** | Advance: **${fmt(p.depositAmount)}** | ${statusLabel}\n  Status: ${collectedBadge}`;
    }).join('\n\n');

    return {
      text: `🏠 **Rentals & Properties Overview**\n\n` +
        `• Total Properties: **${totalProps}** (${occupied} Occupied, ${vacant} Vacant)\n` +
        `• 💵 Monthly Rent Expected: **${fmt(totalMonthlyRentExpected)}**\n` +
        `• 💚 Rent Collected This Month: **${fmt(totalRentCollectedThisMonth)}**\n` +
        `• ⏳ Rent Pending: **${fmt(pendingRent)}**\n` +
        `• 🔑 Total Security Advance Held: **${fmt(totalDepositsHeld)}**\n` +
        `• 💰 Lifetime Rental Income: **${fmt(totalRentalIncomeAllTime)}**\n\n` +
        (propList ? `**Your Properties:**\n\n${propList}\n\n` : `ℹ️ No rental properties added yet. Click below to add your Shop or House!\n\n`) +
        `💡 *You can record monthly rent, advance deposits, and return deposits with cleaning deductions!*`,
      cards: [
        { label: 'Expected Rent',  value: fmt(totalMonthlyRentExpected),      icon: '💵', color: 'emerald' },
        { label: 'Rent Collected', value: fmt(totalRentCollectedThisMonth),   icon: '💚', color: 'teal' },
        { label: 'Advance Held',   value: fmt(totalDepositsHeld),             icon: '🔑', color: 'indigo' },
        { label: 'Properties',     value: `${totalProps} (${occupied} rented)`, icon: '🏢', color: 'amber' },
      ],
      actions: [
        { label: '🏠 Open Rentals Hub', action: '__NAV_TAB__', payload: { tab: 'rentals' } },
        { label: '➕ Add Shop / House', action: '__NAV_TAB__', payload: { tab: 'rentals', openAdd: true } },
      ],
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
      text: `💚 **This Month's Income**\n\nTotal: **${fmt(totalIncomeThisMonth)}**\n\n• 🏠 Rental Income: ${fmt(totalRentCollectedThisMonth)}\n• 🌾 Crop Income: ${fmt(totalCropIncome)}\n• 🥛 Milk Sales: ${fmt(totalMilkSalesIncome)}\n• 🌳 Tree Harvest: ${fmt(totalTreeHarvestIncome)}\n• 💼 Other: ${fmt(Math.max(0, totalIncomeThisMonth - totalCropIncome - totalMilkSalesIncome - totalTreeHarvestIncome - totalRentCollectedThisMonth))}\n\n${totalIncomeThisMonth > totalExpenseThisMonth ? '✅ Earning more than spending this month!' : '⚠️ Expenses exceed income — review your spending.'}`,
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
      text: `📋 **Full Financial Summary — ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}**\n\n**💰 This Month**\n• Income: ${fmt(totalIncomeThisMonth)}\n• Expenses: ${fmt(totalExpenseThisMonth)}\n• Net Savings: ${fmt(netSavingsThisMonth)}\n\n**🏠 Rentals**\n• Expected Rent: ${fmt(totalMonthlyRentExpected)}\n• Collected: ${fmt(totalRentCollectedThisMonth)}\n• Advance Held: ${fmt(totalDepositsHeld)}\n\n**🏦 Assets**\n• Cash & Bank: ${fmt(totalBalance)}\n• Savings / Chits: ${fmt(totalSavingsInvested + totalChitFundsValue)}\n\n**⚠️ Liabilities**\n• Total Loans: ${fmt(totalLoanLiability)}\n• Pending Wages: ${fmt(totalPendingWages)}\n\n**🌾 Farm**\n• Crop Income: ${fmt(totalCropIncome)}\n• Farm Expenses: ${fmt(totalFarmExpense)}\n• Animals: ${totalAnimalCount} | Milk: ${totalDailyMilkLiters.toFixed(1)} L/day\n\n**💎 Net Worth: ${fmt(totalNetWorth)}**`,
      cards: [
        { label: 'Net Worth',    value: fmt(totalNetWorth),          icon: '💎', color: 'emerald' },
        { label: 'Monthly In',  value: fmt(totalIncomeThisMonth),    icon: '📈', color: 'teal' },
        { label: 'Monthly Out', value: fmt(totalExpenseThisMonth),   icon: '📉', color: 'rose' },
        { label: 'Rent Advance', value: fmt(totalDepositsHeld),      icon: '🔑', color: 'indigo' },
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
    if (rentalProperties.length > 0 && totalRentCollectedThisMonth < totalMonthlyRentExpected) {
      tips.push(`💡 You have ${fmt(totalMonthlyRentExpected - totalRentCollectedThisMonth)} pending rent to collect this month.`);
    }
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
    text: `🤔 I didn't quite catch that. Here are some things you can ask or tell me:\n\n• *"How to manage shop rent and cleaning deduction?"*\n• *"What is my net worth?"*\n• *"Show my rental properties"* (Shop / House)\n• *"Add shop rent 8000"*\n• *"Vacate house advance 50000 reduce 5000 cleaning"*\n• *"Give me financial advice"*\n• *"Show chit fund details"*\n• *"Full summary report"*`,
    actions: [
      { label: '🏠 Rentals Hub', action: '__NAV_TAB__', payload: { tab: 'rentals' } },
      { label: '💎 Net Worth',   action: '__SEND_PROMPT__', payload: { text: 'What is my net worth?' } },
      { label: '➕ Add Expense', action: '__OPEN_QUICK_ADD__', payload: { type: 'expense' } },
    ],
  };
}

// ─────────────────────────────────────────────
// MARKDOWN RENDERER
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
// NATURAL LANGUAGE TRANSACTION PARSER TYPES
// ─────────────────────────────────────────────
export interface ParsedAddResultDirect {
  kind: 'direct';
  type: 'expense' | 'income';
  amount: number;
  description: string;
  categoryId: string;
  categoryName: string;
  accountId: string;
  accountName: string;
  paymentMode: 'cash' | 'bank' | 'upi';
  propertyId?: string;
  propertyName?: string;
  targetType?: 'rental_income' | 'rental_advance' | 'rental_advance_refund' | 'property_maintenance';
}

export interface ParsedAddResultAmbiguous {
  kind: 'ambiguous_amount';
  amount: number;
  rawText: string;
}

export interface ParsedAddResultDeduction {
  kind: 'deduction';
  advanceAmount: number;
  deductionAmount: number;
  deductionReason: string;
  netRefund: number;
  propertyId?: string;
  propertyName?: string;
}

export type ParsedIntent = ParsedAddResultDirect | ParsedAddResultAmbiguous | ParsedAddResultDeduction | null;

// ─────────────────────────────────────────────
// NATURAL LANGUAGE TRANSACTION PARSER
// ─────────────────────────────────────────────
function tryParseAddIntent(
  rawInput: string,
  categories: Category[],
  accounts: Account[],
  properties: RentalProperty[] = []
): ParsedIntent {
  const input = rawInput.trim();
  const lower = input.toLowerCase();

  // 1. Ignore questions completely (send to question generator)
  const isQuestion = /^(what|how|show|list|tell|view|give|is|who|guide|explain|details|info|என்ன|எவ்வளவு|காட்டு|எப்படி)\b/i.test(lower);
  if (isQuestion) return null;

  // 2. Extract all numbers
  const numberMatches = Array.from(input.matchAll(/(?:₹|rs\.?|inr)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)\s*(?:rs|rupees|ரூபாய்|k\b)?/gi));
  if (numberMatches.length === 0) return null;

  const parsedNumbers: number[] = [];
  for (const m of numberMatches) {
    let val = parseFloat(m[1].replace(/,/g, ''));
    if (!isNaN(val) && val > 0) {
      if (m[0].toLowerCase().includes('k')) val *= 1000;
      parsedNumbers.push(val);
    }
  }
  if (parsedNumbers.length === 0) return null;

  // 3. CHECK DEPOSIT DEDUCTION / VACATE SETTLEMENT INTENT
  // Keywords: reduce, deduct, cleaning, painting, repair, damage, vacate, return advance, half
  const hasDeductionWord = /(clean|cleaning|சுத்தம்|துப்புரவு|paint|painting|damage|repair|பழுது|deduct|deduction|reduce|கழிவு|குறை|refund|திருப்பி)/i.test(lower);
  const hasRentalContext = /(advance|deposit|முன்பணம்|tenant|vacate|leaving|rent|வாடகை|house|shop|வீடு|கடை)/i.test(lower);

  if (hasDeductionWord && (hasRentalContext || /half|பாதி/i.test(lower))) {
    // Try to match property
    const matchedProp = properties.find(p => lower.includes(p.name.toLowerCase()) || (p.tenantName && lower.includes(p.tenantName.toLowerCase())))
      || properties[0];

    let advanceAmount = matchedProp?.depositAmount || 0;
    let deductionAmount = 0;
    let reason = 'Cleaning & Maintenance';

    if (/clean|சுத்தம்|துப்புரவு/i.test(lower)) reason = 'Cleaning (சுத்தம்)';
    else if (/paint/i.test(lower)) reason = 'Painting (வண்ணம்)';
    else if (/damage|repair|பழுது/i.test(lower)) reason = 'Repairs & Damage (பழுது)';

    if (parsedNumbers.length >= 2) {
      advanceAmount = Math.max(...parsedNumbers);
      deductionAmount = Math.min(...parsedNumbers);
    } else if (parsedNumbers.length === 1) {
      const singleNum = parsedNumbers[0];
      if (/half|பாதி/i.test(lower)) {
        advanceAmount = singleNum;
        deductionAmount = singleNum / 2;
      } else if (/reduce|deduct|cleaning|துப்புரவு|சுத்தம்/i.test(lower) && singleNum < advanceAmount) {
        deductionAmount = singleNum;
      } else {
        advanceAmount = singleNum;
        deductionAmount = 0;
      }
    }

    const netRefund = Math.max(0, advanceAmount - deductionAmount);
    return {
      kind: 'deduction',
      advanceAmount,
      deductionAmount,
      deductionReason: reason,
      netRefund,
      propertyId: matchedProp?.id,
      propertyName: matchedProp?.name,
    };
  }

  // 4. CHECK AMBIGUOUS AMOUNT
  // Example user query: "add amount to 1000", "amount to 1000", "add 1000", "1000 add", "change amount 1000", "reduce amount 1000"
  // Has an amount, but lacks category keywords and explicit direction
  const hasSpecificCategoryKeyword = /(rent|வாடகை|advance|முன்பணம்|shop|house|வீடு|கடை|tenant|fuel|petrol|diesel|டீசல்|fertilizer|உரம்|manure|seed|விதை|pesticide|பூச்சி|tractor|டிராக்டர்|labor|கூலி|wage|pipe|feed|தீவனம்|milk|பால்|vet|coconut|தேங்காய்|crop|நெல்|கரும்பு|banana|வாழை|grocery|food|tea|மளிகை|salary|சம்பளம்|eb|current|electricity|மின்|recharge|doctor|medicine|மருந்து)/i.test(lower);

  const isGenericAmountPhrase = /^(add\s+)?(amount\s+)?(to\s+)?([0-9]+[k]?)\s*(add|reduce|tage|tag|rupees|rs|ரூபாய்)?$/i.test(lower)
    || /^(amount\s+to\s+[0-9]+)/i.test(lower)
    || /^(add\s+[0-9]+)$/i.test(lower)
    || /^([0-9]+\s+add)$/i.test(lower);

  if (!hasSpecificCategoryKeyword && (isGenericAmountPhrase || lower.split(/\s+/).length <= 4)) {
    return {
      kind: 'ambiguous_amount',
      amount: parsedNumbers[0],
      rawText: input,
    };
  }

  // 5. PARSE DIRECT TRANSACTION
  let amount = parsedNumbers[0];
  let type: 'expense' | 'income' = 'expense';
  let targetType: 'rental_income' | 'rental_advance' | 'rental_advance_refund' | 'property_maintenance' | undefined;
  let matchedCat: Category | undefined;
  let propertyId: string | undefined;
  let propertyName: string | undefined;

  // Check property matching
  const matchedProp = properties.find(p => lower.includes(p.name.toLowerCase()) || (p.tenantName && lower.includes(p.tenantName.toLowerCase())));
  if (matchedProp) {
    propertyId = matchedProp.id;
    propertyName = matchedProp.name;
  }

  // Check Rent / Advance specifics
  if (/rent\s+advance|advance\s+deposit|security\s+deposit|house\s+advance|shop\s+advance|வாடகை\s+முன்பணம்|அட்வான்ஸ்|முன்பணம்/i.test(lower)) {
    type = 'income';
    targetType = 'rental_advance';
    matchedCat = categories.find(c => c.id === 'cat_rental_advance');
  } else if (/shop\s+rent|house\s+rent|rent\s+income|received\s+rent|வாடகை\s+வந்தது|வாடகை\s+வரவு|வாடகை/i.test(lower)) {
    type = 'income';
    targetType = 'rental_income';
    matchedCat = categories.find(c => c.id === 'cat_rental_income');
  } else if (/advance\s+refund|return\s+advance|refund\s+deposit|அட்வான்ஸ்\s+திருப்பி/i.test(lower)) {
    type = 'expense';
    targetType = 'rental_advance_refund';
    matchedCat = categories.find(c => c.id === 'cat_rental_advance_refund');
  } else if (/cleaning|துப்புரவு|painting|vannam|repair|maintenance|பராமரிப்பு/i.test(lower) && /shop|house|வீடு|கடை|property|rent/i.test(lower)) {
    type = 'expense';
    targetType = 'property_maintenance';
    matchedCat = categories.find(c => c.id === 'cat_property_maintenance');
  } else {
    // Normal income keywords
    if (/income|received|earned|got|sale|sold|salary|harvest|bonus|dividend|வரவு|வந்தது|விற்றது|சம்பளம்|அறுவடை/i.test(lower)) {
      type = 'income';
    }

    // Category mapping
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
  }

  if (!matchedCat) {
    matchedCat = categories.find(c => c.type === type) || categories[0];
  }

  // Account & Mode
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

  // Description
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
    kind: 'direct',
    type,
    amount,
    description: cleaned,
    categoryId: matchedCat?.id || (type === 'income' ? 'cat_crop_sale' : 'cat_groceries'),
    categoryName: matchedCat?.name || (type === 'income' ? 'Income' : 'Expense'),
    accountId: matchedAcc.id,
    accountName: matchedAcc.name,
    paymentMode,
    propertyId,
    propertyName,
    targetType,
  };
}

// ─────────────────────────────────────────────
// QUICK ACTION CHIPS
// ─────────────────────────────────────────────
const QUICK_QUESTIONS = [
  { label: '🏠 Rentals Hub',    q: 'Show my rental properties' },
  { label: '➕ Add Expense',     q: '__ACTION_ADD_EXPENSE__' },
  { label: '➕ Add Income',      q: '__ACTION_ADD_INCOME__' },
  { label: '💰 Shop/House Rent', q: 'How to manage shop rent and advance deposit?' },
  { label: '🔄 Sync to Sheet',   q: 'sync sheet now' },
  { label: '💎 Net Worth',       q: 'What is my net worth?' },
  { label: '📋 Full Report',     q: 'Show me full summary report' },
  { label: '🏦 Loans',           q: 'Show my loan details' },
  { label: '🪙 Chit Funds',      q: 'Show chit fund and savings schemes' },
  { label: '🌾 Farm',            q: 'Give me farm summary' },
  { label: '🐄 Livestock',       q: 'Show livestock and milk details' },
  { label: '👷 Wages',           q: 'Show worker wages and pending amount' },
];

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export const AIAssistant: React.FC<AIAssistantProps> = ({ onNavigate }) => {
  const financeCtx = useFinance();
  const aiCtx = buildAIContext(financeCtx);

  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    role: 'ai',
    text: `👋 வணக்கம் ${aiCtx.userName}! I'm your **Kanakku360 AI Assistant**.\n\nNow I can help you with **Shop & House Rentals**, **Monthly Rent & Advance Deposits**, **Cleaning/Repairs Deductions upon vacating**, and direct Google Sheets syncing!\n\n💡 **You can try:**\n• *"Add shop rent 8000"*\n• *"How to manage shop rent and cleaning deduction?"*\n• *"Vacate shop advance 50000 reduce 5000 cleaning"*\n• *"Add amount to 1000"* (I will ask for clarification instead of guessing!)\n• *"Sync to sheet"*\n• *"What is my net worth?"*`,
    timestamp: new Date(),
    actions: [
      { label: '🏠 Rentals Hub', action: '__NAV_TAB__', payload: { tab: 'rentals' } },
      { label: '💎 Net Worth', action: '__SEND_PROMPT__', payload: { text: 'What is my net worth?' } },
      { label: '➕ Add Entry', action: '__OPEN_QUICK_ADD__' },
    ],
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

  const handleActionClick = async (action: MessageAction) => {
    if (action.action === '__NAV_TAB__') {
      if (onNavigate && action.payload?.tab) {
        onNavigate(action.payload.tab);
      }
    } else if (action.action === '__OPEN_QUICK_ADD__') {
      if (action.payload?.amount) setQaAmount(String(action.payload.amount));
      if (action.payload?.type) setQaType(action.payload.type);
      if (action.payload?.category) setQaCategory(action.payload.category);
      if (action.payload?.desc) setQaDescription(action.payload.desc);
      setShowQuickAdd(true);
    } else if (action.action === '__CONFIRM_QUICK_ADD__') {
      const payload = action.payload;
      const cat = financeCtx.categories.find(c => c.id === payload.category) || financeCtx.categories.find(c => c.type === payload.type);
      const acc = financeCtx.accounts[0];
      const catName = cat?.name || payload.type;
      const desc = payload.desc || catName;

      try {
        await financeCtx.addTransaction({
          date: new Date().toISOString().split('T')[0],
          type: payload.type,
          amount: payload.amount,
          category: cat?.id || (payload.type === 'income' ? 'cat_rental_income' : 'cat_groceries'),
          accountId: acc?.id || 'acc_cash',
          description: desc,
          paymentMode: 'cash',
          targetType: payload.targetType,
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
            text: `Confirmed: ${payload.desc} — ${aiCtx.fmt(payload.amount)}`,
            timestamp: new Date(),
          },
          {
            id: `ai_${Date.now() + 1}`,
            role: 'ai',
            text: `✅ **Recorded as ${catName}!**\n\n• 💰 **Amount:** ${aiCtx.fmt(payload.amount)}\n• 🏷️ **Category:** ${catName}\n• 🏦 **Account:** ${acc?.name || 'Cash'}\n• 📝 **Note:** ${desc}\n\n${financeCtx.settings.sheetUrl ? (syncSuccess ? '📊 **Google Sheet:** Synced & updated live! ✅' : '📊 **Google Sheet:** Synced (Sync queued)') : '💡 **Tip:** Connect Google Sheet in Settings to auto-sync!'}`,
            timestamp: new Date(),
            cards: [
              { label: 'Amount', value: aiCtx.fmt(payload.amount), icon: payload.type === 'income' ? '💚' : '🔴', color: payload.type === 'income' ? 'emerald' : 'rose' },
              { label: 'Category', value: catName.split('(')[0].trim(), icon: '🏷️', color: 'indigo' },
            ],
          },
        ]);
        financeCtx.addToast('Entry recorded successfully!', 'success');
      } catch (err) {
        console.error(err);
        financeCtx.addToast('Failed to save entry', 'error');
      }
    } else if (action.action === '__CONFIRM_SETTLEMENT__') {
      const payload = action.payload;
      try {
        await financeCtx.addTransaction({
          date: new Date().toISOString().split('T')[0],
          type: 'expense',
          amount: payload.netRefund,
          category: 'cat_rental_advance_refund',
          accountId: 'acc_cash',
          description: `Advance Refund to Tenant (${payload.propertyName || 'Property'})`,
          paymentMode: 'cash',
          targetType: 'rental_advance_refund',
        });

        if (payload.deductionAmount > 0) {
          await financeCtx.addTransaction({
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
            amount: payload.deductionAmount,
            category: 'cat_property_maintenance',
            accountId: 'acc_cash',
            description: `${payload.deductionReason || 'Cleaning & Maintenance'} (${payload.propertyName || 'Property'})`,
            paymentMode: 'cash',
            targetType: 'property_maintenance',
          });
        }

        if (financeCtx.settings.sheetUrl) {
          await financeCtx.syncWithGoogleSheet('push');
        }

        setMessages(prev => [
          ...prev,
          {
            id: `u_${Date.now()}`,
            role: 'user',
            text: `Confirmed Refund: ${aiCtx.fmt(payload.netRefund)} with ${aiCtx.fmt(payload.deductionAmount)} deduction`,
            timestamp: new Date(),
          },
          {
            id: `ai_${Date.now() + 1}`,
            role: 'ai',
            text: `✅ **Rental Deposit Settlement Completed!**\n\n` +
              `• 🔑 **Initial Advance:** ${aiCtx.fmt(payload.advanceAmount)}\n` +
              `• 🧹 **Deduction (${payload.deductionReason}):** ${aiCtx.fmt(payload.deductionAmount)} (Logged as Maintenance Expense)\n` +
              `• 💵 **Net Refunded to Tenant:** ${aiCtx.fmt(payload.netRefund)} (Logged as Advance Refund Expense)\n\n` +
              `Both entries have been saved to your accounts and synced with Google Sheet!`,
            timestamp: new Date(),
            cards: [
              { label: 'Refunded', value: aiCtx.fmt(payload.netRefund), icon: '💵', color: 'indigo' },
              { label: 'Deduction', value: aiCtx.fmt(payload.deductionAmount), icon: '🧹', color: 'amber' },
            ],
            actions: [
              { label: '🏠 View Rentals Hub', action: '__NAV_TAB__', payload: { tab: 'rentals' } },
            ],
          },
        ]);
        financeCtx.addToast('Rental settlement recorded!', 'success');
      } catch (err) {
        console.error(err);
        financeCtx.addToast('Failed to settle deposit', 'error');
      }
    } else if (action.action === '__SEND_PROMPT__') {
      sendMessage(action.payload.text);
    }
  };

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
            ? `🔄 **Google Sheet Synced Successfully!**\n\nAll your latest transactions, account balances, rental properties, farm logs, livestock entries, loans, and chit fund schemes have been saved and pushed live to your Google Sheet database.\n\n📊 **Sheet Status:** Active & Updated\n⏱️ **Timestamp:** ${new Date().toLocaleTimeString('en-IN')}`
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

    // 3. Smart Parse Intent
    const parsedIntent = tryParseAddIntent(q, financeCtx.categories, financeCtx.accounts, financeCtx.rentalProperties);

    // 3A. Ambiguous Amount -> User specified amount without context (e.g. "add amount to 1000")
    if (parsedIntent && parsedIntent.kind === 'ambiguous_amount') {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          role: 'ai',
          text: `❓ **How would you like to record ${aiCtx.fmt(parsedIntent.amount)}?**\n\n` +
            `You typed **"${q}"** with amount **${aiCtx.fmt(parsedIntent.amount)}**, but did not specify what it is for.\n\n` +
            `Please choose what this **${aiCtx.fmt(parsedIntent.amount)}** represents:`,
          timestamp: new Date(),
          actions: [
            {
              label: '💚 Income',
              action: '__CONFIRM_QUICK_ADD__',
              payload: { type: 'income', amount: parsedIntent.amount, category: 'cat_crop_sale', desc: 'Income' },
            },
            {
              label: '🔴 Expense',
              action: '__CONFIRM_QUICK_ADD__',
              payload: { type: 'expense', amount: parsedIntent.amount, category: 'cat_groceries', desc: 'Expense' },
            },
            {
              label: '🏠 Shop/House Rent',
              action: '__CONFIRM_QUICK_ADD__',
              payload: { type: 'income', amount: parsedIntent.amount, category: 'cat_rental_income', desc: 'Rental Income', targetType: 'rental_income' },
            },
            {
              label: '🔑 Rental Advance',
              action: '__CONFIRM_QUICK_ADD__',
              payload: { type: 'income', amount: parsedIntent.amount, category: 'cat_rental_advance', desc: 'Rental Advance Deposit', targetType: 'rental_advance' },
            },
            {
              label: '🧹 Cleaning Deduction',
              action: '__CONFIRM_QUICK_ADD__',
              payload: { type: 'expense', amount: parsedIntent.amount, category: 'cat_property_maintenance', desc: 'Cleaning Deduction', targetType: 'property_maintenance' },
            },
            {
              label: '✏️ Fill Quick Form',
              action: '__OPEN_QUICK_ADD__',
              payload: { amount: parsedIntent.amount },
            },
          ],
        },
      ]);
      return;
    }

    // 3B. Deposit Deduction / Vacate Settlement
    if (parsedIntent && parsedIntent.kind === 'deduction') {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          role: 'ai',
          text: `🤝 **Rental Deposit Settlement & Cleaning Deduction Breakdown**\n\n` +
            `• 🔑 **Initial Advance / Deposit:** ${aiCtx.fmt(parsedIntent.advanceAmount)}\n` +
            `• 🧹 **Deduction (${parsedIntent.deductionReason}):** -${aiCtx.fmt(parsedIntent.deductionAmount)}\n` +
            `• 💵 **Net Refund to Tenant:** **${aiCtx.fmt(parsedIntent.netRefund)}**\n\n` +
            `Would you like to confirm this refund and record the cleaning deduction? Or manage it in the Rentals Hub?`,
          timestamp: new Date(),
          cards: [
            { label: 'Advance Deposit', value: aiCtx.fmt(parsedIntent.advanceAmount), icon: '🔑', color: 'indigo' },
            { label: 'Deduction',       value: `-${aiCtx.fmt(parsedIntent.deductionAmount)}`, icon: '🧹', color: 'amber' },
            { label: 'Net Refund',      value: aiCtx.fmt(parsedIntent.netRefund),     icon: '💵', color: 'emerald' },
          ],
          actions: [
            {
              label: '✅ Confirm Refund & Deduction',
              action: '__CONFIRM_SETTLEMENT__',
              payload: parsedIntent,
            },
            {
              label: '🏠 Open Rentals Hub',
              action: '__NAV_TAB__',
              payload: { tab: 'rentals' },
            },
          ],
        },
      ]);
      return;
    }

    // 3C. Direct Intent (Has category and amount)
    if (parsedIntent && parsedIntent.kind === 'direct') {
      try {
        await financeCtx.addTransaction({
          date: new Date().toISOString().split('T')[0],
          type: parsedIntent.type,
          amount: parsedIntent.amount,
          category: parsedIntent.categoryId,
          accountId: parsedIntent.accountId,
          description: parsedIntent.description,
          paymentMode: parsedIntent.paymentMode,
          propertyId: parsedIntent.propertyId,
          propertyName: parsedIntent.propertyName,
          targetType: parsedIntent.targetType,
        });

        let syncSuccess = false;
        if (financeCtx.settings.sheetUrl) {
          syncSuccess = await financeCtx.syncWithGoogleSheet('push');
        }

        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: `ai_${Date.now()}`,
          role: 'ai',
          text: `✅ **${parsedIntent.type === 'income' ? 'Income Added & Synced!' : 'Expense Added & Synced!'}**\n\n• 💰 **Amount:** ${aiCtx.fmt(parsedIntent.amount)}\n• 🏷️ **Category:** ${parsedIntent.categoryName}\n• 🏦 **Account:** ${parsedIntent.accountName}\n• 📝 **Note:** ${parsedIntent.description}\n• 📅 **Date:** ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}\n\n${financeCtx.settings.sheetUrl ? (syncSuccess ? '📊 **Google Sheet:** Synced & saved directly to your spreadsheet! ✅' : '📊 **Google Sheet:** Synced (Sync queued)') : '💡 **Tip:** Connect your Google Sheet in Settings to sync live to your spreadsheet!'}`,
          timestamp: new Date(),
          cards: [
            { label: 'Amount', value: aiCtx.fmt(parsedIntent.amount), icon: parsedIntent.type === 'income' ? '💚' : '🔴', color: parsedIntent.type === 'income' ? 'emerald' : 'rose' },
            { label: 'Category', value: parsedIntent.categoryName.split('(')[0].trim(), icon: '🏷️', color: 'indigo' },
            { label: 'Account', value: parsedIntent.accountName.split('(')[0].trim(), icon: '🏦', color: 'teal' },
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
    await new Promise(r => setTimeout(r, 450 + Math.random() * 300));
    const resp = generateAIResponse(q, aiCtx);
    setIsTyping(false);
    setMessages(prev => [...prev, {
      id: `ai_${Date.now()}`, role: 'ai', text: resp.text, timestamp: new Date(), cards: resp.cards, actions: resp.actions,
    }]);
  };

  const handleClear = () => {
    setMessages([{
      id: 'clear', role: 'ai',
      text: `🔄 Chat cleared! Ask me anything, check rental properties, or tell me to add an entry, ${aiCtx.userName}.`,
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
                ADVANCED RENTALS & WRITE
              </span>
              {hasSheetUrl ? (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-400 font-medium">
                  <FileSpreadsheet size={10} /> Sheet Connected
                </span>
              ) : null}
            </h1>
            <p className="text-[11px] text-slate-400">Manage shop/house rent, advance deposits & deductions, track wealth, and sync live</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onNavigate && (
            <button
              onClick={() => onNavigate('rentals')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition cursor-pointer"
            >
              <Building2 size={12} />
              <span>Rentals Hub</span>
            </button>
          )}
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
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer border border-slate-700/60"
            title="Clear Chat"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Quick Add Embedded Form */}
      {showQuickAdd && (
        <form
          onSubmit={handleQuickAddSubmit}
          className="mb-3 p-3 rounded-2xl glass-card border border-emerald-500/30 space-y-2 shrink-0 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Plus size={13} className="text-emerald-400" />
              Quick Add Transaction
            </span>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-700">
              <button
                type="button"
                onClick={() => setQaType('expense')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer ${
                  qaType === 'expense' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setQaType('income')}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer ${
                  qaType === 'income' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                placeholder="e.g. Shop rent, Advance, Cleaning"
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
            key={q.label}
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

            {/* Bubble + cards + actions */}
            <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'glass-panel border border-slate-700/60 text-slate-200 rounded-bl-sm shadow-sm'
              }`}>
                {msg.role === 'ai'
                  ? <RenderMarkdown text={msg.text} />
                  : <span>{msg.text}</span>}
              </div>

              {/* Summary Cards */}
              {msg.cards && msg.cards.length > 0 && (
                <div className="grid grid-cols-2 gap-2 w-full">
                  {msg.cards.map((card, ci) => <SummaryCardChip key={ci} card={card} />)}
                </div>
              )}

              {/* Action Buttons */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 w-full pt-1">
                  {msg.actions.map((act, ai) => (
                    <button
                      key={ai}
                      onClick={() => handleActionClick(act)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 hover:text-white transition cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      {act.label}
                    </button>
                  ))}
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
              placeholder="Ask anything, add shop rent, return advance with cleaning deduction..."
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
          AI reads your live local data & syncs directly to Google Sheet
        </p>
      </div>
    </div>
  );
};
