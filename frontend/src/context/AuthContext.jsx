import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { categorizeFrontend } from '../utils/categorizerFrontend';

const AuthContext = createContext();

const INITIAL_MOCK_EXPENSES = [
  {
    _id: 'mock-1',
    description: 'UBER TRIPS / CAB RIDE / 20260901 / 7482',
    amount: 450,
    category: 'Travel',
    protocol: 'DIRECT',
    isNeedsReview: false,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'mock-2',
    description: 'Ramesh Stores / Tea & Evening Refreshment',
    amount: 35,
    category: 'Food',
    protocol: 'DIRECT',
    isNeedsReview: true,
    suggestedCategory: 'Food',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'mock-3',
    description: 'UPI/P2P/9876543210/Ramesh Kumar Urgent Medical Loan',
    amount: 2500,
    category: 'Transfers & Friend Loans',
    protocol: 'P2P',
    isNeedsReview: false,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'mock-4',
    description: 'SWIGGY ORDER #98412 / LUNCH',
    amount: 380,
    category: 'Food',
    protocol: 'DIRECT',
    isNeedsReview: false,
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'mock-5',
    description: 'NETFLIX PREMIUM MONTHLY SUBSCRIPTION',
    amount: 649,
    category: 'Subscriptions',
    protocol: 'DIRECT',
    isNeedsReview: false,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'mock-6',
    description: 'BESCOM ELECTRICITY BILL BANGALORE',
    amount: 1850,
    category: 'Utilities',
    protocol: 'DIRECT',
    isNeedsReview: false,
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'mock-7',
    description: 'UPI/P2M/PAYTMQR98412/Ramesh Canteen Tiffin',
    amount: 65,
    category: 'Food',
    protocol: 'P2M',
    isNeedsReview: false,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'mock-8',
    description: 'AMAZON RETAIL INDIA / ELECTRONICS',
    amount: 2499,
    category: 'Shopping',
    protocol: 'DIRECT',
    isNeedsReview: false,
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('cashburn_token') || 'demo-jwt-token');
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('cashburn_user')) || {
      id: 'demo-user-1',
      email: 'developer@cashburn.io',
      monthlyBudget: 50000,
    }
  );

  const [expenses, setExpenses] = useState(INITIAL_MOCK_EXPENSES);
  const [userRules, setUserRules] = useState([]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Set Axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Initial Data Fetch / Offline Fallback
  useEffect(() => {
    if (token && !isOfflineMode) {
      fetchBackendData();
    }
  }, [token, isOfflineMode]);

  const fetchBackendData = async () => {
    try {
      setLoading(true);
      const [expRes, analyticsRes] = await Promise.all([
        axios.get('/api/expenses'),
        axios.get('/api/analytics'),
      ]);
      setExpenses(expRes.data.expenses || []);
      setIsOfflineMode(false);
    } catch (err) {
      console.warn('Backend unavailable, switching to local client fallback mode:', err.message);
      setIsOfflineMode(true);
    } finally {
      setLoading(false);
    }
  };

  // Mathematical Analytics Calculator (Client-Side & Fallback Mirror)
  const computeAnalytics = () => {
    const monthlyBudget = user?.monthlyBudget || 50000;
    const now = new Date();

    let total30DaySpend = 0;
    let consumption30DaySpend = 0; // EXCLUDES Transfers & Friend Loans
    const categoryTotals = {};

    expenses.forEach((e) => {
      const amt = Number(e.amount) || 0;
      total30DaySpend += amt;
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + amt;

      // EXCLUDE P2P Friend Loans from consumption velocity v
      if (e.category !== 'Transfers & Friend Loans') {
        consumption30DaySpend += amt;
      }
    });

    // v = consumption spend over 30 days / 30
    const dailyVelocity = Math.round((consumption30DaySpend / 30) * 100) / 100 || 1450;
    const remainingBudget = monthlyBudget - consumption30DaySpend;

    let daysRemaining = 0;
    let forecastedZeroDate = '';
    let isInfiniteRunway = false;
    let isDepleted = false;

    if (remainingBudget <= 0) {
      isDepleted = true;
      daysRemaining = 0;
      forecastedZeroDate = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } else if (dailyVelocity === 0) {
      isInfiniteRunway = true;
      daysRemaining = 999;
      forecastedZeroDate = 'Infinite Runway (₹0/day spend)';
    } else {
      daysRemaining = Math.max(1, Math.round(remainingBudget / dailyVelocity));
      const zeroDateObj = new Date(now.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
      forecastedZeroDate = zeroDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    // Top Spend Category
    let topSpendCategory = 'None';
    let topSpendAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, sum]) => {
      if (sum > topSpendAmount) {
        topSpendAmount = sum;
        topSpendCategory = cat;
      }
    });

    // Recharts Unified Canvas Array (Solid Actual Line + Dashed Projection Slope)
    const chartData = [];
    const past14Days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      past14Days.push({ dateStr });
    }

    const dailyMap = {};
    expenses.forEach((exp) => {
      const dStr = new Date(exp.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyMap[dStr] = (dailyMap[dStr] || 0) + Number(exp.amount);
    });

    let cumulativeSpend = 0;
    past14Days.forEach((pDay) => {
      const daySpend = dailyMap[pDay.dateStr] || 0;
      cumulativeSpend += daySpend;
      const currentBal = Math.max(0, monthlyBudget - cumulativeSpend);

      chartData.push({
        date: pDay.dateStr,
        actualBalance: currentBal,
        projectedBalance: currentBal,
      });
    });

    // Projection slope down to zero
    const currentActualBal = Math.max(0, remainingBudget);
    const projSteps = Math.min(daysRemaining > 0 ? daysRemaining : 1, 25);
    for (let i = 1; i <= projSteps; i += Math.max(1, Math.floor(projSteps / 6))) {
      const futureDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const fStr = futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const projBal = Math.max(0, currentActualBal - i * dailyVelocity);

      chartData.push({
        date: fStr,
        actualBalance: null,
        projectedBalance: Math.round(projBal),
      });
    }

    return {
      monthlyBudget,
      remainingBudget,
      dailyVelocity,
      daysRemaining,
      forecastedZeroDate,
      isInfiniteRunway,
      isDepleted,
      topSpendCategory,
      topSpendAmount,
      categoryTotals,
      total30DaySpend,
      consumption30DaySpend,
      chartData,
    };
  };

  // Auth Operations
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('cashburn_token', newToken);
      localStorage.setItem('cashburn_user', JSON.stringify(newUser));
      setIsOfflineMode(false);
      return { success: true };
    } catch (err) {
      const demoUser = { id: 'demo-user-1', email, monthlyBudget: 50000 };
      setToken('demo-jwt-token');
      setUser(demoUser);
      localStorage.setItem('cashburn_token', 'demo-jwt-token');
      localStorage.setItem('cashburn_user', JSON.stringify(demoUser));
      setIsOfflineMode(true);
      return { success: true, offline: true };
    }
  };

  const register = async (email, password, monthlyBudget) => {
    try {
      const res = await axios.post('/api/auth/register', { email, password, monthlyBudget });
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('cashburn_token', newToken);
      localStorage.setItem('cashburn_user', JSON.stringify(newUser));
      setIsOfflineMode(false);
      return { success: true };
    } catch (err) {
      const demoUser = { id: 'demo-user-1', email, monthlyBudget: Number(monthlyBudget) || 50000 };
      setToken('demo-jwt-token');
      setUser(demoUser);
      localStorage.setItem('cashburn_token', 'demo-jwt-token');
      localStorage.setItem('cashburn_user', JSON.stringify(demoUser));
      setIsOfflineMode(true);
      return { success: true, offline: true };
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('cashburn_token');
    localStorage.removeItem('cashburn_user');
  };

  const updateBudget = async (newBudget) => {
    const val = Number(newBudget);
    const updatedUser = { ...user, monthlyBudget: val };
    setUser(updatedUser);
    localStorage.setItem('cashburn_user', JSON.stringify(updatedUser));

    if (!isOfflineMode) {
      try {
        await axios.put('/api/auth/budget', { monthlyBudget: val });
      } catch (err) {
        console.warn('Backend update failed:', err);
      }
    }
  };

  // Expense Operations
  const addExpense = async (expData) => {
    if (!isOfflineMode) {
      try {
        const res = await axios.post('/api/expenses', expData);
        setExpenses((prev) => [res.data.expense, ...prev]);
        return;
      } catch (err) {
        console.warn('API add failed, inserting locally:', err);
      }
    }

    // Local execution with 4-Layer categorizer
    const catResult = categorizeFrontend(expData.description, expData.amount, expData.timestamp, userRules);
    const newExp = {
      _id: 'local-' + Date.now(),
      description: expData.description,
      amount: Number(expData.amount),
      category: expData.category && expData.category !== 'Auto-Detect' ? expData.category : catResult.category,
      protocol: catResult.protocol,
      isNeedsReview: catResult.isNeedsReview,
      timestamp: expData.timestamp || new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const deleteExpense = async (id) => {
    setExpenses((prev) => prev.filter((e) => e._id !== id));
    if (!isOfflineMode) {
      try {
        await axios.delete(`/api/expenses/${id}`);
      } catch (err) {
        console.warn('API delete error:', err);
      }
    }
  };

  const reTagExpense = async (id, newCategory) => {
    const target = expenses.find((e) => e._id === id);
    if (target) {
      // Save merchant rule locally (Layer 2 Learning)
      const descLower = target.description.toLowerCase();
      const newRule = { merchantPattern: descLower.substring(0, 10), category: newCategory };
      setUserRules((prev) => [...prev, newRule]);

      setExpenses((prev) =>
        prev.map((e) => {
          if (e._id === id || e.description.toLowerCase().includes(newRule.merchantPattern)) {
            return { ...e, category: newCategory, isNeedsReview: false };
          }
          return e;
        })
      );
    }

    if (!isOfflineMode) {
      try {
        await axios.put(`/api/expenses/${id}/retag`, { newCategory });
      } catch (err) {
        console.warn('API retag error:', err);
      }
    }
  };

  /**
   * Smart Adaptive CSV Parser (Supports all bank statement formats & templates)
   */
  const uploadCSV = async (file) => {
    if (!isOfflineMode) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await axios.post('/api/expenses/upload-csv', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.expenses && res.data.expenses.length > 0) {
          setExpenses(res.data.expenses);
          return { success: true, count: res.data.processedCount };
        }
      } catch (err) {
        console.warn('API CSV upload failed or returned empty, using smart client fallback:', err);
      }
    }

    // Smart Adaptive Client-Side RAM Parser Fallback
    const text = await file.text();
    const rawLines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (rawLines.length === 0) return { success: false, count: 0 };

    let delimiter = ',';
    if (rawLines[0].includes(';') && !rawLines[0].includes(',')) delimiter = ';';
    else if (rawLines[0].includes('\t') && !rawLines[0].includes(',')) delimiter = '\t';

    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === delimiter && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map((cell) => cell.replace(/^"|"$/g, '').trim());
    };

    let headerRowIdx = 0;
    let headers = parseCSVLine(rawLines[0]);

    for (let i = 0; i < Math.min(rawLines.length, 6); i++) {
      const cells = parseCSVLine(rawLines[i]);
      const joined = cells.join(' ').toLowerCase();
      if (
        joined.includes('desc') ||
        joined.includes('narrat') ||
        joined.includes('remark') ||
        joined.includes('particular') ||
        joined.includes('detail') ||
        joined.includes('amount') ||
        joined.includes('debit') ||
        joined.includes('date')
      ) {
        headerRowIdx = i;
        headers = cells;
        break;
      }
    }

    let descIdx = -1;
    let amountIdx = -1;
    let dateIdx = -1;

    headers.forEach((h, idx) => {
      const hClean = h.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (
        descIdx === -1 &&
        (hClean.includes('description') ||
          hClean.includes('narrat') ||
          hClean.includes('remark') ||
          hClean.includes('particular') ||
          hClean.includes('detail') ||
          hClean.includes('memo') ||
          hClean.includes('payee') ||
          hClean.includes('merchant') ||
          hClean.includes('item'))
      ) {
        descIdx = idx;
      }
      if (
        amountIdx === -1 &&
        (hClean.includes('amount') ||
          hClean.includes('debit') ||
          hClean.includes('withdrawal') ||
          hClean.includes('spent') ||
          hClean.includes('amt') ||
          hClean.includes('value'))
      ) {
        amountIdx = idx;
      }
      if (
        dateIdx === -1 &&
        (hClean.includes('date') || hClean.includes('time') || hClean.includes('timestamp'))
      ) {
        dateIdx = idx;
      }
    });

    const dataRows = [];
    for (let i = headerRowIdx + 1; i < rawLines.length; i++) {
      const cells = parseCSVLine(rawLines[i]);
      if (cells.length > 0 && cells.some((c) => c.length > 0)) {
        dataRows.push(cells);
      }
    }

    if (dataRows.length > 0) {
      if (descIdx === -1 || amountIdx === -1) {
        const sample = dataRows[0];
        sample.forEach((cell, idx) => {
          const num = parseFloat(cell.replace(/[^0-9.-]+/g, ''));
          const isNum = !isNaN(num) && num > 0 && /[0-9]/.test(cell);
          if (amountIdx === -1 && isNum) {
            amountIdx = idx;
          } else if (descIdx === -1 && cell.length > 2 && isNaN(cell)) {
            descIdx = idx;
          } else if (dateIdx === -1 && (cell.includes('/') || cell.includes('-'))) {
            dateIdx = idx;
          }
        });
      }
    }

    if (descIdx === -1) descIdx = 1 < headers.length ? 1 : 0;
    if (amountIdx === -1) amountIdx = 2 < headers.length ? 2 : descIdx === 0 ? 1 : 0;
    if (dateIdx === -1) dateIdx = 0;

    const parsed = [];
    dataRows.forEach((cells, i) => {
      const desc = cells[descIdx] || '';
      const rawAmt = cells[amountIdx] || '0';
      const date = cells[dateIdx] || new Date().toISOString();

      const amt = Math.abs(parseFloat(rawAmt.replace(/[^0-9.-]+/g, '')) || 0);

      if (desc && desc.trim().length > 0 && amt > 0) {
        const catRes = categorizeFrontend(desc, amt, date, userRules);
        parsed.push({
          _id: 'csv-' + Date.now() + '-' + i,
          description: desc.trim(),
          amount: amt,
          category: catRes.category,
          protocol: catRes.protocol,
          isNeedsReview: catRes.isNeedsReview,
          timestamp: date || new Date().toISOString(),
        });
      }
    });

    if (parsed.length > 0) {
      setExpenses((prev) => [...parsed, ...prev]);
    }

    return { success: true, count: parsed.length };
  };

  const value = {
    token,
    user,
    expenses,
    analytics: computeAnalytics(),
    isOfflineMode,
    loading,
    login,
    register,
    logout,
    updateBudget,
    addExpense,
    deleteExpense,
    reTagExpense,
    uploadCSV,
    toggleOfflineMode: () => setIsOfflineMode(!isOfflineMode),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
