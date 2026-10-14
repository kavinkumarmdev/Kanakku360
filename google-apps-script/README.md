# 📊 Kanakku360 Google Sheet Database Setup Guide

Use any Google Sheet as your personal, zero-cost, private database for Kanakku360.

---

## 🚀 3-Minute Quick Setup

### Step 1: Create a Google Sheet
1. Open [Google Sheets](https://sheets.new) in your browser.
2. Name the sheet **`Kanakku360 Database`**.

### Step 2: Open Apps Script Editor
1. In the top menu, click **Extensions** > **Apps Script**.
2. Delete any boilerplate code inside `Code.gs`.
3. Copy the entire contents of [`Code.gs`](./Code.gs) and paste it into the editor.
4. Click the **Save** disk icon (or press `Ctrl+S` / `Cmd+S`).

### Step 3: Deploy as a Web App
1. In the top-right corner of the Apps Script editor, click **Deploy** > **New deployment**.
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**.
3. Configure settings:
   - **Description**: `Kanakku360 Production API`
   - **Execute as**: `Me (<your-email@gmail.com>)`
   - **Who has access**: `Anyone` *(Crucial: allows Kanakku360 UI to communicate with your sheet securely)*
4. Click **Deploy**.
5. Grant permissions if prompted (Click *Advanced* -> *Go to Kanakku360 (unsafe)* -> *Allow*).

### Step 4: Connect in Kanakku360
1. Copy the **Web app URL** (starts with `https://script.google.com/macros/s/.../exec`).
2. Open **Kanakku360** in your browser.
3. Click **Settings** (or the Cloud Sync button in top bar).
4. Paste the URL into **Google Apps Script URL** and click **Test & Connect**.
5. Click **Sync to Google Sheet** to initialize all your categories, accounts, budgets, and transactions!

---

## 📑 Unified 8-Table Architecture

The database is organized into **8 unified tables** that power the entire Kanakku360 ecosystem (Auth, Profiles, System Lookups, Accounts, Ledger, Real Estate & Agri Assets, and Loans & Chits):

1. **`UserMaster`**: Multi-user accounts, family members, employees, farm workers & roles (`id, username, password, role, userType, status, createdAt`)
2. **`UserDetails`**: Extensible attributes for family & employees: salaries, daily coolie wages, designations, phone, bank info (`id, userId, categoryName, value, updatedAt`)
3. **`LoginHistory`**: Device and session security audit log (`id, userId, username, loginTime, ipAddress, userAgent, status`)
4. **`DropdownMaster`**: Centralized taxonomy for categories, units, and dropdowns (`id, primaryCategory, secondaryCategory, value, labelEn, labelTa, icon, color, sortOrder, isActive`)
5. **`AccountsMaster`**: Liquid funds, bank accounts, UPI, and wallets (`id, userId, name, type, accountNumber, balance, color, icon, isDefault, status, createdAt`)
6. **`TransactionsMaster`**: Universal ledger for expenses, incomes, farm labor wages, milk/egg sales, coconut harvests, and rental collections (`id, userId, memberId, date, type, amount, categoryId, accountId, toAccountId, description, paymentMode, entityType, entityId, quantity, unitRate, paymentStatus, dueDate, tags, metadataJson, createdAt`)
7. **`AssetsMaster`**: Physical assets including rental homes & shops (tenant ID, advance deposit, rent/lease amount, maintenance, property tax & due dates), farm land plots, boundary trees, and livestock (`id, userId, tenantId, assetType, name, nameTa, subType, agreementType, status, currentValue, advanceDeposit, rentOrLeaseAmount, maintenanceAmount, dueDayOfMonth, propertyTaxAmount, propertyTaxDueDate, taxAssessmentNumber, specsJson, notes, createdAt, updatedAt`)
8. **`CommitmentsMaster`**: Recurring contractual obligations, loans, Tamil chit funds (சீட்டு), RD, FD, and savings goals (`id, userId, commitmentType, name, institution, principalOrTargetAmount, currentAmount, interestRate, emiOrInstallment, startDate, dueDate, tenureMonths, status, detailsJson, notes, createdAt, updatedAt`)

👉 For the full column-by-column schema and JSON specs, see **[`table structure`](./table%20structure)**.
