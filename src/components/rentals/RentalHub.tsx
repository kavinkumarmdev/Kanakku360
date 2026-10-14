import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';
import type { RentalProperty, PropertyType, PaymentMode } from '../../types/finance';
import {
  Building2,
  Home,
  Store,
  Key,
  DoorOpen,
  Plus,
  Calendar,
  Phone,
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit3,
  Receipt,
  UserCheck,
  UserPlus,
  X,
  History,
  Building,
} from 'lucide-react';

export const RentalHub: React.FC = () => {
  const {
    rentalProperties,
    accounts,
    settings,
    totalMonthlyRentExpected,
    totalRentCollectedThisMonth,
    totalDepositsHeld,
    totalRentalIncomeAllTime,
    addRentalProperty,
    updateRentalProperty,
    deleteRentalProperty,
    collectPropertyRent,
    settleAndVacateProperty,
    assignTenantToProperty,
  } = useFinance();

  const isTa = settings.language === 'ta';
  const currency = settings.currency;
  const fmt = (n: number) => formatCurrency(n, currency);

  // View state
  const [activeTab, setActiveTab] = useState<'properties' | 'history'>('properties');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<RentalProperty | null>(null);

  const [collectRentProperty, setCollectRentProperty] = useState<RentalProperty | null>(null);
  const [rentAmount, setRentAmount] = useState<string>('');
  const [rentDate, setRentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [rentPeriod, setRentPeriod] = useState<string>(
    new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  );
  const [rentAccountId, setRentAccountId] = useState<string>(accounts[0]?.id || 'acc_cash');
  const [rentMode, setRentMode] = useState<PaymentMode>('bank');
  const [rentNotes, setRentNotes] = useState<string>('');

  // Vacate / Settlement Modal state
  const [vacateProperty, setVacateProperty] = useState<RentalProperty | null>(null);
  const [vacateDate, setVacateDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [cleaningDeduction, setCleaningDeduction] = useState<string>('');
  const [paintingDeduction, setPaintingDeduction] = useState<string>('');
  const [damageDeduction, setDamageDeduction] = useState<string>('');
  const [billsDeduction, setBillsDeduction] = useState<string>('');
  const [deductionNotes, setDeductionNotes] = useState<string>('Cleaning & Painting / சுத்தம் & பெயிண்டிங்');
  const [refundAccountId, setRefundAccountId] = useState<string>(accounts[0]?.id || 'acc_bank');
  const [refundMode, setRefundMode] = useState<PaymentMode>('bank');

  // New Tenant Modal state
  const [assignProperty, setAssignProperty] = useState<RentalProperty | null>(null);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantPhone, setNewTenantPhone] = useState('');
  const [newMonthlyRent, setNewMonthlyRent] = useState('');
  const [newDeposit, setNewDeposit] = useState('');
  const [newDepositDate, setNewDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordNewDeposit, setRecordNewDeposit] = useState(true);
  const [newDepositAccountId, setNewDepositAccountId] = useState(accounts[0]?.id || 'acc_bank');

  // Add/Edit Form state
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<PropertyType>('shop');
  const [formAgreementType, setFormAgreementType] = useState<'rent' | 'lease' | 'commercial_lease' | 'own_use'>('rent');
  const [formAddress, setFormAddress] = useState('');
  const [formStatus, setFormStatus] = useState<'occupied' | 'vacant'>('occupied');
  const [formTenantName, setFormTenantName] = useState('');
  const [formTenantPhone, setFormTenantPhone] = useState('');
  const [formTenantAadhaar, setFormTenantAadhaar] = useState('');
  const [formMonthlyRent, setFormMonthlyRent] = useState('');
  const [formDueDay, setFormDueDay] = useState('1');
  const [formMaintenance, setFormMaintenance] = useState('');
  const [formDeposit, setFormDeposit] = useState('');
  const [formDepositDate, setFormDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [formPropertyTax, setFormPropertyTax] = useState('');
  const [formTaxDueDate, setFormTaxDueDate] = useState('');
  const [formTaxAssessmentNumber, setFormTaxAssessmentNumber] = useState('');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formRecordDeposit, setFormRecordDeposit] = useState(true);
  const [formDepositAccountId, setFormDepositAccountId] = useState(accounts[0]?.id || 'acc_bank');
  const [formNotes, setFormNotes] = useState('');

  const openAddModal = () => {
    setPropertyToEdit(null);
    setFormName('');
    setFormType('shop');
    setFormAgreementType('rent');
    setFormAddress('');
    setFormStatus('occupied');
    setFormTenantName('');
    setFormTenantPhone('');
    setFormTenantAadhaar('');
    setFormMonthlyRent('');
    setFormDueDay('1');
    setFormMaintenance('');
    setFormDeposit('');
    setFormDepositDate(new Date().toISOString().split('T')[0]);
    setFormPropertyTax('');
    setFormTaxDueDate('');
    setFormTaxAssessmentNumber('');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormRecordDeposit(true);
    setFormDepositAccountId(accounts[0]?.id || 'acc_bank');
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (p: RentalProperty) => {
    setPropertyToEdit(p);
    setFormName(p.name);
    setFormType(p.type);
    setFormAgreementType(p.agreementType || 'rent');
    setFormAddress(p.address || '');
    setFormStatus(p.status);
    setFormTenantName(p.tenantName || '');
    setFormTenantPhone(p.tenantPhone || '');
    setFormTenantAadhaar(p.tenantAadhaar || '');
    setFormMonthlyRent(p.monthlyRent ? String(p.monthlyRent) : '');
    setFormDueDay(p.dueDayOfMonth ? String(p.dueDayOfMonth) : '1');
    setFormMaintenance(p.maintenanceAmount ? String(p.maintenanceAmount) : '');
    setFormDeposit(p.depositAmount ? String(p.depositAmount) : '');
    setFormDepositDate(p.depositReceivedDate || new Date().toISOString().split('T')[0]);
    setFormPropertyTax(p.propertyTaxAmount ? String(p.propertyTaxAmount) : '');
    setFormTaxDueDate(p.propertyTaxDueDate || '');
    setFormTaxAssessmentNumber(p.taxAssessmentNumber || '');
    setFormStartDate(p.leaseStartDate || new Date().toISOString().split('T')[0]);
    setFormRecordDeposit(false);
    setFormDepositAccountId(p.depositAccountId || accounts[0]?.id || 'acc_bank');
    setFormNotes(p.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const rentAmt = parseFloat(formMonthlyRent) || 0;
    const depAmt = parseFloat(formDeposit) || 0;
    const maintAmt = parseFloat(formMaintenance) || 0;
    const taxAmt = parseFloat(formPropertyTax) || 0;
    const dueDay = parseInt(formDueDay, 10) || 1;

    if (propertyToEdit) {
      await updateRentalProperty(propertyToEdit.id, {
        name: formName.trim(),
        type: formType,
        agreementType: formAgreementType,
        address: formAddress.trim(),
        status: formStatus,
        tenantName: formStatus === 'occupied' ? formTenantName.trim() : '',
        tenantPhone: formStatus === 'occupied' ? formTenantPhone.trim() : '',
        tenantAadhaar: formStatus === 'occupied' ? formTenantAadhaar.trim() : '',
        monthlyRent: rentAmt,
        dueDayOfMonth: dueDay,
        maintenanceAmount: maintAmt,
        depositAmount: depAmt,
        depositReceivedDate: formDepositDate,
        propertyTaxAmount: taxAmt,
        propertyTaxDueDate: formTaxDueDate.trim(),
        taxAssessmentNumber: formTaxAssessmentNumber.trim(),
        leaseStartDate: formStartDate,
        notes: formNotes.trim(),
      });
    } else {
      await addRentalProperty(
        {
          name: formName.trim(),
          type: formType,
          agreementType: formAgreementType,
          address: formAddress.trim(),
          status: formStatus,
          tenantName: formStatus === 'occupied' ? formTenantName.trim() : '',
          tenantPhone: formStatus === 'occupied' ? formTenantPhone.trim() : '',
          tenantAadhaar: formStatus === 'occupied' ? formTenantAadhaar.trim() : '',
          monthlyRent: rentAmt,
          dueDayOfMonth: dueDay,
          maintenanceAmount: maintAmt,
          depositAmount: depAmt,
          depositReceivedDate: formDepositDate,
          depositAccountId: formDepositAccountId,
          propertyTaxAmount: taxAmt,
          propertyTaxDueDate: formTaxDueDate.trim(),
          taxAssessmentNumber: formTaxAssessmentNumber.trim(),
          leaseStartDate: formStartDate,
          notes: formNotes.trim(),
        },
        formRecordDeposit && formStatus === 'occupied',
        formDepositAccountId
      );
    }

    setIsAddModalOpen(false);
  };

  // Open Collect Rent Modal
  const openCollectRent = (p: RentalProperty) => {
    setCollectRentProperty(p);
    setRentAmount(String(p.monthlyRent || ''));
    setRentDate(new Date().toISOString().split('T')[0]);
    setRentPeriod(new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }));
    setRentAccountId(accounts[0]?.id || 'acc_cash');
    setRentMode('bank');
    setRentNotes('');
  };

  const handleCollectRentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectRentProperty) return;
    const amt = parseFloat(rentAmount);
    if (isNaN(amt) || amt <= 0) return;

    await collectPropertyRent(collectRentProperty.id, {
      amount: amt,
      date: rentDate,
      periodMonth: rentPeriod,
      paymentMode: rentMode,
      accountId: rentAccountId,
      notes: rentNotes.trim(),
    });

    setCollectRentProperty(null);
  };

  // Open Vacate Settlement Modal
  const openVacateModal = (p: RentalProperty) => {
    setVacateProperty(p);
    setVacateDate(new Date().toISOString().split('T')[0]);
    setCleaningDeduction('');
    setPaintingDeduction('');
    setDamageDeduction('');
    setBillsDeduction('');
    setDeductionNotes('Cleaning & Painting charges / சுத்தம் & பெயிண்டிங் பிடித்தம்');
    setRefundAccountId(accounts[0]?.id || 'acc_bank');
    setRefundMode('bank');
  };

  // Calculation for Vacate Settlement
  const origDep = vacateProperty?.depositAmount || 0;
  const cleanAmt = parseFloat(cleaningDeduction) || 0;
  const paintAmt = parseFloat(paintingDeduction) || 0;
  const dmgAmt = parseFloat(damageDeduction) || 0;
  const billsAmt = parseFloat(billsDeduction) || 0;
  const totalDeductions = cleanAmt + paintAmt + dmgAmt + billsAmt;
  const netRefundAmount = Math.max(0, origDep - totalDeductions);

  const handleVacateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacateProperty) return;

    await settleAndVacateProperty(vacateProperty.id, {
      vacateDate,
      deductionAmount: totalDeductions,
      deductionReason: deductionNotes.trim(),
      cleaningDeduction: cleanAmt > 0 ? cleanAmt : undefined,
      paintingDeduction: paintAmt > 0 ? paintAmt : undefined,
      damageDeduction: dmgAmt > 0 ? dmgAmt : undefined,
      unpaidBillsDeduction: billsAmt > 0 ? billsAmt : undefined,
      refundAmount: netRefundAmount,
      paymentMode: refundMode,
      accountId: refundAccountId,
      notes: deductionNotes.trim(),
    });

    setVacateProperty(null);
  };

  // Open Assign New Tenant Modal
  const openAssignModal = (p: RentalProperty) => {
    setAssignProperty(p);
    setNewTenantName('');
    setNewTenantPhone('');
    setNewMonthlyRent(p.monthlyRent ? String(p.monthlyRent) : '');
    setNewDeposit('');
    setNewDepositDate(new Date().toISOString().split('T')[0]);
    setNewStartDate(new Date().toISOString().split('T')[0]);
    setRecordNewDeposit(true);
    setNewDepositAccountId(accounts[0]?.id || 'acc_bank');
  };

  const handleAssignTenantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignProperty || !newTenantName.trim()) return;

    const rentAmt = parseFloat(newMonthlyRent) || 0;
    const depAmt = parseFloat(newDeposit) || 0;

    await assignTenantToProperty(assignProperty.id, {
      tenantName: newTenantName.trim(),
      tenantPhone: newTenantPhone.trim(),
      monthlyRent: rentAmt,
      depositAmount: depAmt,
      depositDate: newDepositDate,
      leaseStartDate: newStartDate,
      accountId: newDepositAccountId,
      recordDepositAsIncome: recordNewDeposit,
    });

    setAssignProperty(null);
  };

  // Filtered properties
  const filteredProperties = rentalProperties.filter(p => {
    if (filterType !== 'all' && p.type !== filterType) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    return true;
  });

  const allSettlements = rentalProperties.flatMap(p =>
    (p.settlements || []).map(s => ({ ...s, propertyName: p.name, propertyType: p.type }))
  ).sort((a, b) => new Date(b.vacateDate).getTime() - new Date(a.vacateDate).getTime());

  const allPayments = rentalProperties.flatMap(p =>
    (p.payments || []).map(pm => ({ ...pm, propertyName: p.name, propertyType: p.type }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const occupiedCount = rentalProperties.filter(p => p.status === 'occupied').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Building2 size={20} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                {isTa ? 'வாடகை & சொத்துக்கள்' : 'Shops & House Rentals'}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold">
                  {rentalProperties.length} {isTa ? 'சொத்துக்கள்' : 'Properties'}
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {isTa
                  ? 'கடை & வீட்டு மாத வாடகை வரவு, அட்வான்ஸ் முன்பணம் மற்றும் காலி செய்யும்போது சுத்தம் பிடித்தம் செய்து திருப்பி செலுத்தும் கணக்கு'
                  : 'Track monthly shop & house rent, initial advance deposits, and settlement refunds with cleaning deductions'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>{isTa ? 'புதிய கடை / வீடு சேர்க்க' : 'Add Property'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Monthly Rent Expected */}
        <div className="glass-panel rounded-2xl p-4.5 border border-slate-800/80 bg-slate-900/60 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {isTa ? 'மாத வாடகை எதிர்பார்ப்பு' : 'Monthly Rent Expected'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Store size={15} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {fmt(totalMonthlyRentExpected)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-normal">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block" />
              {occupiedCount} {isTa ? 'வாடகைக்கு விடப்பட்டுள்ளது' : 'occupied units'}
            </p>
          </div>
        </div>

        {/* Rent Collected This Month */}
        <div className="glass-panel rounded-2xl p-4.5 border border-slate-800/80 bg-slate-900/60 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {isTa ? 'இந்த மாதம் வந்த வாடகை' : 'Rent Collected (This Month)'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
              <Receipt size={15} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-emerald-400 tracking-tight">
              +{fmt(totalRentCollectedThisMonth)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-normal">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 inline-block" />
              {isTa ? 'நடப்பு மாத வரவு' : 'Inflow recorded this month'}
            </p>
          </div>
        </div>

        {/* Total Advance Deposits Held */}
        <div className="glass-panel rounded-2xl p-4.5 border border-slate-800/80 bg-slate-900/60 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {isTa ? 'முன்பணம் கையிருப்பு (அட்வான்ஸ்)' : 'Security Deposits Held'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Key size={15} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-indigo-300 tracking-tight">
              {fmt(totalDepositsHeld)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-normal">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 inline-block" />
              {isTa ? 'காலி செய்யும்போது திருப்பக் கூடியது' : 'Refundable when tenant leaves'}
            </p>
          </div>
        </div>

        {/* All-Time Rent Income */}
        <div className="glass-panel rounded-2xl p-4.5 border border-slate-800/80 bg-slate-900/60 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {isTa ? 'மொத்த வாடகை வருவாய்' : 'Total Rent Income'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Building size={15} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-amber-300 tracking-tight">
              {fmt(totalRentalIncomeAllTime)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-normal">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 inline-block" />
              {isTa ? 'இதுவரை பதிவு செய்யப்பட்ட வாடகை' : 'All-time total rent recorded'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        {/* View switcher */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start">
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'properties'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 size={13} />
            <span>{isTa ? 'சொத்துக்கள் & கடைகள்' : 'Properties'}</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History size={13} />
            <span>{isTa ? 'வாடகை & செட்டில்மென்ட் வரலாறு' : 'History & Settlements'}</span>
          </button>
        </div>

        {/* Filter chips */}
        {activeTab === 'properties' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">{isTa ? 'அனைத்து வகைகள்' : 'All Property Types'}</option>
              <option value="shop">{isTa ? '🏪 கடை (Shop)' : 'Shop'}</option>
              <option value="house">{isTa ? '🏠 வீடு (House)' : 'House'}</option>
              <option value="commercial">{isTa ? '🏢 வணிக வளாகம்' : 'Commercial'}</option>
              <option value="room">{isTa ? '🚪 அறை (Room)' : 'Room'}</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">{isTa ? 'அனைத்து நிலைகள்' : 'All Status'}</option>
              <option value="occupied">{isTa ? '🟢 வாடகைக்கு உள்ளது' : 'Occupied'}</option>
              <option value="vacant">{isTa ? '⚪ காலியாக உள்ளது' : 'Vacant'}</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === 'properties' && (
        <div>
          {filteredProperties.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800/80 bg-slate-900/30">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Store size={26} />
              </div>
              <h3 className="text-base font-bold text-white">
                {isTa ? 'வாடகை கடைகள் அல்லது வீடுகள் எதுவும் சேர்க்கப்படவில்லை' : 'No Rental Properties Found'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {isTa
                  ? 'உங்கள் கடை அல்லது வீட்டை சேர்த்து, மாதாந்திர வாடகை, முன்பணம் அட்வான்ஸ் மற்றும் காலி செய்யும்போது பிடித்தங்களை எளிதாக நிர்வகியுங்கள்.'
                  : 'Add your shops or houses to easily record monthly rent, initial deposits, and deposit returns with cleaning deductions.'}
              </p>
              <button
                onClick={openAddModal}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus size={14} />
                <span>{isTa ? 'முதல் சொத்தை சேர்க்க' : 'Add First Property'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProperties.map(property => {
                const isOccupied = property.status === 'occupied';

                return (
                  <div
                    key={property.id}
                    className="glass-panel rounded-2xl p-5 border border-slate-800/80 bg-slate-900/60 hover:border-slate-700 transition flex flex-col justify-between shadow-sm relative group"
                  >
                    <div>
                      {/* Top row: Type Icon + Name + Status Badge */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              property.type === 'shop'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : property.type === 'house'
                                ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            }`}
                          >
                            {property.type === 'shop' ? (
                              <Store size={18} />
                            ) : property.type === 'house' ? (
                              <Home size={18} />
                            ) : (
                              <Building size={18} />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-sm line-clamp-1">
                              {property.name}
                            </h3>
                            <p className="text-[11px] text-slate-400 capitalize">
                              {property.type === 'shop'
                                ? (isTa ? '🏪 கடை' : 'Shop')
                                : property.type === 'house'
                                ? (isTa ? '🏠 வீடு' : 'House')
                                : property.type}
                              {property.address ? ` • ${property.address}` : ''}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border shrink-0 ${
                            isOccupied
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {isOccupied ? (isTa ? '🟢 வாடகையில்' : 'Occupied') : (isTa ? '⚪ காலி' : 'Vacant')}
                        </span>
                      </div>

                      {/* Tenant Information Banner */}
                      {isOccupied ? (
                        <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 mb-3 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <UserCheck size={13} className="text-emerald-400" />
                              {isTa ? 'குடியிருப்பாளர் / கடைக்காரர்:' : 'Tenant:'}
                            </span>
                            <span className="font-semibold text-white">
                              {property.tenantName || 'Tenant'}
                            </span>
                          </div>

                          {property.tenantPhone && (
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400 flex items-center gap-1.5">
                                <Phone size={11} className="text-slate-500" />
                                {isTa ? 'தொலைபேசி:' : 'Phone:'}
                              </span>
                              <a
                                href={`tel:${property.tenantPhone}`}
                                className="text-emerald-400 hover:underline"
                              >
                                {property.tenantPhone}
                              </a>
                            </div>
                          )}

                          {property.tenantAadhaar && (
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400 flex items-center gap-1.5">
                                <Key size={11} className="text-slate-500" />
                                {isTa ? 'ஆதார் / ஐடி:' : 'ID / Aadhaar:'}
                              </span>
                              <span className="text-slate-300 font-mono text-[10px]">
                                {property.tenantAadhaar}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/50">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Calendar size={11} className="text-slate-500" />
                              {isTa ? 'வாடகை நாள்:' : 'Rent Due:'}
                            </span>
                            <span className="text-slate-300">
                              {isTa ? `மாதம் ${property.dueDayOfMonth || 1}-ம் தேதி` : `${property.dueDayOfMonth || 1}st of month`}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/50 mb-3 text-center">
                          <p className="text-xs text-slate-400">
                            {isTa ? 'தற்போது இந்த இடம் காலியாக உள்ளது' : 'Property is currently vacant'}
                          </p>
                          <button
                            onClick={() => openAssignModal(property)}
                            className="mt-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <UserPlus size={12} />
                            <span>{isTa ? 'புதிய வாடகைதாரரை சேர்க்க' : 'Assign New Tenant'}</span>
                          </button>
                        </div>
                      )}

                      {/* Agreement Type & Maintenance Tag */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        {property.agreementType && property.agreementType !== 'rent' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold">
                            {property.agreementType === 'lease' ? (isTa ? '🔒 ஒத்தி / லீஸ்' : 'Lease') : property.agreementType}
                          </span>
                        )}
                        {Boolean(property.maintenanceAmount) && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                            {isTa ? `பராமரிப்பு: ${fmt(property.maintenanceAmount!)}/mo` : `Maint: ${fmt(property.maintenanceAmount!)}/mo`}
                          </span>
                        )}
                        {Boolean(property.propertyTaxAmount) && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                            {isTa ? `சொத்து வரி: ${fmt(property.propertyTaxAmount!)}/yr` : `Tax: ${fmt(property.propertyTaxAmount!)}/yr`}
                          </span>
                        )}
                      </div>

                      {/* Financial Figures */}
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="bg-slate-950/40 rounded-xl p-2.5 border border-slate-800/50">
                          <p className="text-[10px] text-slate-400 font-medium">
                            {isTa ? 'மாத வாடகை' : 'Monthly Rent'}
                          </p>
                          <p className="font-bold text-white text-sm mt-0.5">
                            {fmt(property.monthlyRent)}
                          </p>
                        </div>

                        <div className="bg-slate-950/40 rounded-xl p-2.5 border border-slate-800/50">
                          <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <Key size={10} className="text-indigo-400" />
                            {isTa ? 'முன்பணம் அட்வான்ஸ்' : 'Security Advance'}
                          </p>
                          <p className="font-bold text-indigo-300 text-sm mt-0.5">
                            {fmt(property.depositAmount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {isOccupied ? (
                          <>
                            <button
                              onClick={() => openCollectRent(property)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition inline-flex items-center gap-1 cursor-pointer shadow-sm"
                              title={isTa ? 'வாடகை பெறப்பட்டது என பதிவு செய்' : 'Collect Monthly Rent'}
                            >
                              <Receipt size={12} />
                              <span>{isTa ? 'வாடகை வரவு' : 'Collect Rent'}</span>
                            </button>

                            <button
                              onClick={() => openVacateModal(property)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                              title={isTa ? 'காலி செய்து அட்வான்ஸ் திருப்பி கொடுக்க' : 'Vacate & Return Advance'}
                            >
                              <DoorOpen size={12} />
                              <span>{isTa ? 'காலி & அட்வான்ஸ்' : 'Vacate & Refund'}</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => openAssignModal(property)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition inline-flex items-center gap-1 cursor-pointer shadow-sm"
                          >
                            <UserPlus size={12} />
                            <span>{isTa ? 'வாடகைதாரர் நியமிக்க' : 'Add Tenant'}</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(property)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Edit"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(isTa ? 'இந்த சொத்தை நீக்க வேண்டுமா?' : 'Delete this rental property?')) {
                              deleteRentalProperty(property.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* History & Settlements View */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Vacate Settlements Section */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 bg-slate-900/60 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <DoorOpen size={16} className="text-amber-400" />
              {isTa ? 'காலி செய்த & அட்வான்ஸ் செட்டில்மென்ட் விவரங்கள்' : 'Vacate & Advance Settlements'}
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                {allSettlements.length}
              </span>
            </h3>

            {allSettlements.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                {isTa ? 'இதுவரை எந்த வாடகைதாரரும் காலி செய்து செட்டில்மென்ட் செய்யப்படவில்லை' : 'No vacate settlements recorded yet'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="pb-2 font-medium">{isTa ? 'தேதி' : 'Date'}</th>
                      <th className="pb-2 font-medium">{isTa ? 'சொத்து / நபர்' : 'Property / Tenant'}</th>
                      <th className="pb-2 font-medium">{isTa ? 'முழு முன்பணம்' : 'Original Advance'}</th>
                      <th className="pb-2 font-medium">{isTa ? 'பிடித்தம் (சுத்தம்/சேதாரம்)' : 'Deductions (Cleaning/Damages)'}</th>
                      <th className="pb-2 font-medium">{isTa ? 'திருப்பி கொடுத்த தொகை' : 'Net Refund Given'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {allSettlements.map(s => (
                      <tr key={s.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-2.5 text-slate-300 whitespace-nowrap">
                          {new Date(s.vacateDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-2.5">
                          <p className="font-semibold text-white">{s.propertyName}</p>
                          <p className="text-[11px] text-slate-400">{s.tenantName}</p>
                        </td>
                        <td className="py-2.5 font-medium text-slate-300">
                          {fmt(s.originalDeposit)}
                        </td>
                        <td className="py-2.5">
                          {s.deductionAmount > 0 ? (
                            <div>
                              <span className="font-semibold text-rose-400">-{fmt(s.deductionAmount)}</span>
                              <p className="text-[10px] text-slate-400">{s.deductionReason || 'Cleaning'}</p>
                            </div>
                          ) : (
                            <span className="text-emerald-400 font-medium">{isTa ? 'முழு தொகை (பிடித்தம் இல்லை)' : 'Full Refund (₹0)'}</span>
                          )}
                        </td>
                        <td className="py-2.5 font-bold text-emerald-400">
                          {fmt(s.refundedAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Rent Payments History */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 bg-slate-900/60 shadow-sm">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Receipt size={16} className="text-emerald-400" />
              {isTa ? 'பெறப்பட்ட மாத வாடகை பதிவுகள்' : 'Rent Collection History'}
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                {allPayments.length}
              </span>
            </h3>

            {allPayments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                {isTa ? 'இதுவரை எந்த வாடகை வரவும் பதிவு செய்யப்படவில்லை' : 'No rent collections recorded yet'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="pb-2 font-medium">{isTa ? 'தேதி' : 'Date'}</th>
                      <th className="pb-2 font-medium">{isTa ? 'சொத்து' : 'Property'}</th>
                      <th className="pb-2 font-medium">{isTa ? 'மாதம்' : 'Period'}</th>
                      <th className="pb-2 font-medium">{isTa ? 'வாடகைதாரர்' : 'Tenant'}</th>
                      <th className="pb-2 font-medium">{isTa ? 'தொகை' : 'Amount'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {allPayments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-2.5 text-slate-300 whitespace-nowrap">
                          {new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-2.5 font-semibold text-white">
                          {p.propertyName}
                        </td>
                        <td className="py-2.5 text-slate-300">
                          {p.periodMonth || '-'}
                        </td>
                        <td className="py-2.5 text-slate-400">
                          {p.tenantName || '-'}
                        </td>
                        <td className="py-2.5 font-bold text-emerald-400">
                          +{fmt(p.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. ADD / EDIT PROPERTY MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Store size={18} className="text-emerald-400" />
                {propertyToEdit
                  ? (isTa ? 'சொத்து விவரங்களை மாற்ற' : 'Edit Rental Property')
                  : (isTa ? 'புதிய கடை / வீடு சேர்க்க' : 'Add Rental Property')}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProperty} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {isTa ? 'சொத்து வகை' : 'Property Type'} *
                  </label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as PropertyType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="shop">{isTa ? '🏪 கடை (Shop)' : 'Shop'}</option>
                    <option value="house">{isTa ? '🏠 வீடு (House / Flat)' : 'House / Flat'}</option>
                    <option value="commercial">{isTa ? '🏢 வணிக வளாகம் (Commercial)' : 'Commercial'}</option>
                    <option value="room">{isTa ? '🚪 அறை (Room / Godown)' : 'Room / Godown'}</option>
                    <option value="land">{isTa ? '🌾 காலி நிலம் / குத்தகை' : 'Plot / Land Lease'}</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {isTa ? 'தற்போதைய நிலை' : 'Current Status'}
                  </label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as 'occupied' | 'vacant')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="occupied">{isTa ? '🟢 வாடகைக்கு விடப்பட்டுள்ளது (Occupied)' : 'Occupied'}</option>
                    <option value="vacant">{isTa ? '⚪ காலியாக உள்ளது (Vacant)' : 'Vacant'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {isTa ? 'சொத்து பெயர் / எண்' : 'Property Name / Number'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={isTa ? 'எ.கா: கடை எண் 4 (Main Road), மாடி வீடு 2BHK' : 'e.g. Main Street Shop #1, Upstairs 2BHK'}
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {isTa ? 'முகவரி / இருப்பிடம்' : 'Address / Location'}
                </label>
                <input
                  type="text"
                  placeholder={isTa ? 'எ.கா: பேருந்து நிலையம் அருகில், ஈரோடு' : 'e.g. Near Bus Stand, Erode'}
                  value={formAddress}
                  onChange={e => setFormAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {isTa ? 'மாத வாடகை தொகை (₹)' : 'Monthly Rent (₹)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="8000"
                    value={formMonthlyRent}
                    onChange={e => setFormMonthlyRent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {isTa ? 'வாடகை நாள் (தேதி)' : 'Due Day of Month'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="1"
                    value={formDueDay}
                    onChange={e => setFormDueDay(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {isTa ? 'ஒப்பந்த வகை' : 'Agreement Model'}
                  </label>
                  <select
                    value={formAgreementType}
                    onChange={e => setFormAgreementType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="rent">{isTa ? '📅 மாத வாடகை (Monthly Rent)' : 'Monthly Rent'}</option>
                    <option value="lease">{isTa ? '🔒 ஒத்தி / லீஸ் (Long-term Lease)' : 'Lease (Othi)'}</option>
                    <option value="commercial_lease">{isTa ? '🏢 வணிக லீஸ் (Commercial Lease)' : 'Commercial Lease'}</option>
                    <option value="own_use">{isTa ? '🏠 சொந்த உபயோகம் (Own Use)' : 'Own Use'}</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {isTa ? 'மாத பராமரிப்பு கட்டணம் (₹)' : 'Monthly Maintenance (₹)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="500"
                    value={formMaintenance}
                    onChange={e => setFormMaintenance(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {formStatus === 'occupied' && (
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                  <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <UserCheck size={14} />
                    {isTa ? 'வாடகைதாரர் & முன்பணம் அட்வான்ஸ் விவரங்கள்' : 'Tenant & Security Deposit Details'}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        {isTa ? 'வாடகைதாரர் பெயர்' : 'Tenant Name'}
                      </label>
                      <input
                        type="text"
                        placeholder={isTa ? 'முருகன் / ரமேஷ்' : 'Tenant Name'}
                        value={formTenantName}
                        onChange={e => setFormTenantName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        {isTa ? 'தொலைபேசி எண்' : 'Phone Number'}
                      </label>
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={formTenantPhone}
                        onChange={e => setFormTenantPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      {isTa ? 'ஆதார் / அடையாள அட்டை எண்' : 'Aadhaar / Legal ID Proof'}
                    </label>
                    <input
                      type="text"
                      placeholder="XXXX-XXXX-4589"
                      value={formTenantAadhaar}
                      onChange={e => setFormTenantAadhaar(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        {isTa ? 'முன்பணம் அட்வான்ஸ் (₹)' : 'Advance Deposit (₹)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="50000"
                        value={formDeposit}
                        onChange={e => setFormDeposit(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        {isTa ? 'வாடகை தொடங்கிய தேதி' : 'Lease Start Date'}
                      </label>
                      <input
                        type="date"
                        value={formStartDate}
                        onChange={e => setFormStartDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {!propertyToEdit && parseFloat(formDeposit) > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={formRecordDeposit}
                          onChange={e => setFormRecordDeposit(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{isTa ? 'இந்த முன்பணத்தை இப்போது வங்கியில் வரவாக சேர்க்க' : 'Record this advance deposit as income now'}</span>
                      </label>

                      {formRecordDeposit && (
                        <div className="mt-2">
                          <label className="block text-[11px] text-slate-400 mb-1">
                            {isTa ? 'முன்பணம் வரவான கணக்கு' : 'Deposit Received In'}
                          </label>
                          <select
                            value={formDepositAccountId}
                            onChange={e => setFormDepositAccountId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          >
                            {accounts.map(acc => (
                              <option key={acc.id} value={acc.id}>
                                {acc.name} ({fmt(acc.balance)})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Property Tax & Government Assessment Section */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Building size={14} />
                  {isTa ? 'சொத்து வரி & நகராட்சி மதிப்பீடு' : 'Property Tax & Government Assessment'}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      {isTa ? 'ஆண்டு சொத்து வரி (₹)' : 'Annual Property Tax (₹)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="3200"
                      value={formPropertyTax}
                      onChange={e => setFormPropertyTax(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      {isTa ? 'வரி செலுத்த இறுதி தேதி' : 'Tax Due Date'}
                    </label>
                    <input
                      type="date"
                      value={formTaxDueDate}
                      onChange={e => setFormTaxDueDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    {isTa ? 'வரி விதிப்பு எண் / மின் இணைப்பு (EB) எண்' : 'Tax Assessment Number / EB Consumer #'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TAX-MDU-88 or EB-04-102-45"
                    value={formTaxAssessmentNumber}
                    onChange={e => setFormTaxAssessmentNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {isTa ? 'குறிப்புகள்' : 'Notes'}
                </label>
                <textarea
                  rows={2}
                  placeholder={isTa ? 'மின் இணைப்பு விவரங்கள், ஒப்பந்த விபரம்...' : 'Electricity meter #, lease duration...'}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  {isTa ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
                >
                  {propertyToEdit ? (isTa ? 'சேமிக்கவும்' : 'Save Changes') : (isTa ? 'சொத்து சேர்க்க' : 'Add Property')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. COLLECT RENT MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {collectRentProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Receipt size={18} className="text-emerald-400" />
                  {isTa ? 'மாத வாடகை வரவு பதிவு' : 'Collect Monthly Rent'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {collectRentProperty.name} ({collectRentProperty.tenantName || 'Tenant'})
                </p>
              </div>
              <button
                onClick={() => setCollectRentProperty(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCollectRentSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {isTa ? 'வாடகை தொகை (₹)' : 'Rent Amount (₹)'} *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={rentAmount}
                  onChange={e => setRentAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {isTa ? 'பெறப்பட்ட தேதி' : 'Date'} *
                  </label>
                  <input
                    type="date"
                    required
                    value={rentDate}
                    onChange={e => setRentDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {isTa ? 'வாடகை மாதம்' : 'Rent Period Month'}
                  </label>
                  <input
                    type="text"
                    placeholder="October 2026"
                    value={rentPeriod}
                    onChange={e => setRentPeriod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {isTa ? 'வரவு சேரும் கணக்கு' : 'Deposit Into Account'}
                  </label>
                  <select
                    value={rentAccountId}
                    onChange={e => setRentAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({fmt(acc.balance)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {isTa ? 'பரிமாற்ற முறை' : 'Payment Mode'}
                  </label>
                  <select
                    value={rentMode}
                    onChange={e => setRentMode(e.target.value as PaymentMode)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="bank">Bank / Transfer</option>
                    <option value="upi">UPI / GPay / PhonePe</option>
                    <option value="cash">Cash in Hand</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {isTa ? 'குறிப்பு' : 'Notes (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={isTa ? 'எ.கா: Google Pay மூலம் வந்தது' : 'e.g. Paid via GPay'}
                  value={rentNotes}
                  onChange={e => setRentNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCollectRentProperty(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  {isTa ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
                >
                  {isTa ? 'வாடகை வரவு சேமிக்க' : 'Save Rent Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. VACATE & DEPOSIT SETTLEMENT MODAL (With Deductions!) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {vacateProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <DoorOpen size={18} className="text-rose-400" />
                  {isTa ? 'காலி செய்தல் & அட்வான்ஸ் செட்டில்மென்ட்' : 'Vacate & Settle Advance Refund'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {vacateProperty.name} • {vacateProperty.tenantName || 'Tenant'}
                </p>
              </div>
              <button
                onClick={() => setVacateProperty(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleVacateSubmit} className="mt-4 space-y-4">
              {/* Advance Overview Box */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400">
                    {isTa ? 'முன்பணம் அட்வான்ஸ் பெற்ற தொகை' : 'Initial Security Deposit Received'}
                  </p>
                  <p className="text-xl font-black text-indigo-300 mt-0.5">
                    {fmt(origDep)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-semibold">
                    {isTa ? 'கையிருப்பு' : 'Held Deposit'}
                  </span>
                </div>
              </div>

              {/* Vacate Date */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {isTa ? 'காலி செய்த தேதி' : 'Vacate Date'} *
                </label>
                <input
                  type="date"
                  required
                  value={vacateDate}
                  onChange={e => setVacateDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Deductions Breakdown */}
              <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" />
                    {isTa ? 'பிடித்தங்கள் (சுத்தம், பெயிண்டிங் & சேதாரம்)' : 'Deductions (Cleaning, Painting & Damages)'}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {isTa ? 'தேவைக்கேற்ப பிடித்தம் செய்யலாம்' : 'Optional deductions'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      🧹 {isTa ? 'சுத்தம் செய்தல் கட்டணம்' : 'Cleaning Charges'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="2000"
                      value={cleaningDeduction}
                      onChange={e => setCleaningDeduction(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      🎨 {isTa ? 'பெயிண்டிங் பிடித்தம்' : 'Painting Charges'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="3000"
                      value={paintingDeduction}
                      onChange={e => setPaintingDeduction(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      🔧 {isTa ? 'சேதாரம் & பழுது' : 'Damages & Repairs'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="1000"
                      value={damageDeduction}
                      onChange={e => setDamageDeduction(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      ⚡ {isTa ? 'EB / வாடகை பாக்கி' : 'EB Bills / Rent Due'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="500"
                      value={billsDeduction}
                      onChange={e => setBillsDeduction(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    {isTa ? 'பிடித்தம் விபரம் / காரணம்' : 'Deduction Reason / Notes'}
                  </label>
                  <input
                    type="text"
                    value={deductionNotes}
                    onChange={e => setDeductionNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Settlement Summary Calculation Box */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-teal-950/40 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>{isTa ? 'அட்வான்ஸ் தொகை:' : 'Original Deposit:'}</span>
                  <span className="font-semibold text-white">{fmt(origDep)}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-rose-400">
                  <span>{isTa ? 'மொத்த பிடித்தம்:' : 'Total Deductions:'}</span>
                  <span className="font-semibold">-{fmt(totalDeductions)}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-sm font-bold">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={16} />
                    {isTa ? 'வாடகைதாரருக்கு திருப்பி கொடுக்கும் தொகை:' : 'Net Refund to Tenant:'}
                  </span>
                  <span className="text-xl text-emerald-400">
                    {fmt(netRefundAmount)}
                  </span>
                </div>
              </div>

              {/* Refund Payment Mode and Account */}
              {netRefundAmount > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      {isTa ? 'பணம் கொடுக்கும் கணக்கு' : 'Refund Paid From Account'}
                    </label>
                    <select
                      value={refundAccountId}
                      onChange={e => setRefundAccountId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({fmt(acc.balance)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      {isTa ? 'பரிமாற்ற முறை' : 'Payment Mode'}
                    </label>
                    <select
                      value={refundMode}
                      onChange={e => setRefundMode(e.target.value as PaymentMode)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="bank">Bank / Transfer</option>
                      <option value="upi">UPI / GPay / PhonePe</option>
                      <option value="cash">Cash in Hand</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setVacateProperty(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  {isTa ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition"
                >
                  {isTa ? 'செட்டில் செய்து காலி செய்ய' : 'Confirm Vacate & Settle Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. ASSIGN NEW TENANT MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {assignProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <UserPlus size={18} className="text-emerald-400" />
                  {isTa ? 'புதிய வாடகைதாரரை நியமிக்க' : 'Assign New Tenant'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {assignProperty.name}
                </p>
              </div>
              <button
                onClick={() => setAssignProperty(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAssignTenantSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {isTa ? 'வாடகைதாரர் பெயர்' : 'Tenant Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={isTa ? 'எ.கா: குமார் / சுரேஷ்' : 'e.g. Kumar / Suresh'}
                  value={newTenantName}
                  onChange={e => setNewTenantName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {isTa ? 'தொலைபேசி எண்' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={newTenantPhone}
                  onChange={e => setNewTenantPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {isTa ? 'மாத வாடகை (₹)' : 'Monthly Rent (₹)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="8000"
                    value={newMonthlyRent}
                    onChange={e => setNewMonthlyRent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {isTa ? 'முன்பணம் அட்வான்ஸ் (₹)' : 'Advance Deposit (₹)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="50000"
                    value={newDeposit}
                    onChange={e => setNewDeposit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {isTa ? 'அட்வான்ஸ் வாங்கிய தேதி' : 'Advance Date'}
                  </label>
                  <input
                    type="date"
                    value={newDepositDate}
                    onChange={e => setNewDepositDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {isTa ? 'குடியேறும் தேதி' : 'Move-in Date'}
                  </label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={e => setNewStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {parseFloat(newDeposit) > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={recordNewDeposit}
                      onChange={e => setRecordNewDeposit(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{isTa ? 'அட்வான்ஸ் தொகையை இப்போது வங்கி/ரொக்கத்தில் வரவு வைக்க' : 'Record advance deposit into account'}</span>
                  </label>

                  {recordNewDeposit && (
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        {isTa ? 'வரவு சேரும் கணக்கு' : 'Deposit Into'}
                      </label>
                      <select
                        value={newDepositAccountId}
                        onChange={e => setNewDepositAccountId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      >
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({fmt(acc.balance)})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAssignProperty(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  {isTa ? 'ரத்து' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
                >
                  {isTa ? 'நியமிக்க' : 'Assign Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
