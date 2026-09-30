import Expense from '../models/Expense.js';
import User from '../models/User.js';

export const getCashBurnAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    const monthlyBudget = user ? user.monthlyBudget : 50000;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch expenses in the last 30 days using compound index { userId: 1, timestamp: -1 }
    const expenses = await Expense.find({
      userId,
      timestamp: { $gte: thirtyDaysAgo },
    }).sort({ timestamp: 1 });

    // Current month start
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthExpenses = expenses.filter((e) => new Date(e.timestamp) >= currentMonthStart);

    // 1. Calculate Total Spend & Exclude P2P Friend Loans from Daily Velocity (v)
    let total30DaySpend = 0;
    let consumption30DaySpend = 0; // Excludes Transfers & Friend Loans
    let currentMonthConsumptionSpend = 0;

    const categoryTotals = {};

    for (const exp of expenses) {
      const amt = Number(exp.amount) || 0;
      total30DaySpend += amt;

      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + amt;

      // EXCLUDE P2P Friend Loans from consumption cash-burn velocity
      if (exp.category !== 'Transfers & Friend Loans') {
        consumption30DaySpend += amt;
      }
    }

    for (const exp of currentMonthExpenses) {
      if (exp.category !== 'Transfers & Friend Loans') {
        currentMonthConsumptionSpend += Number(exp.amount) || 0;
      }
    }

    // Daily Velocity Math: v = Consumption Spend over 30 days / 30
    const dailyVelocity = Math.round((consumption30DaySpend / 30) * 100) / 100;

    // Remaining Budget: B_rem = MonthlyBudget - Current Month Consumption Spend
    const remainingBudget = monthlyBudget - currentMonthConsumptionSpend;

    // Days Remaining & Zero Date Calculation
    let daysRemaining = null;
    let forecastedZeroDate = null;
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
      // Math: D_rem = B_rem / v
      daysRemaining = Math.max(1, Math.round(remainingBudget / dailyVelocity));
      const zeroDateObj = new Date(now.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
      forecastedZeroDate = zeroDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    // Top Spend Category Identification
    let topSpendCategory = 'None';
    let topSpendAmount = 0;
    for (const [cat, sum] of Object.entries(categoryTotals)) {
      if (sum > topSpendAmount) {
        topSpendAmount = sum;
        topSpendCategory = cat;
      }
    }

    // 2. Generate Recharts Extrapolation Array (Actual Solid Line + Projected Dashed Slope)
    const chartData = [];

    // Group actual daily spends for past 14 days up to today
    const past14Days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      past14Days.push({ dateObj: d, dateStr });
    }

    let runningBalance = monthlyBudget;
    // Calculate cumulative spend
    const dailyMap = {};
    for (const exp of currentMonthExpenses) {
      const dStr = new Date(exp.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyMap[dStr] = (dailyMap[dStr] || 0) + Number(exp.amount);
    }

    let cumulativeSpend = 0;
    for (const pDay of past14Days) {
      const daySpend = dailyMap[pDay.dateStr] || 0;
      cumulativeSpend += daySpend;
      const currentBal = Math.max(0, monthlyBudget - cumulativeSpend);

      chartData.push({
        date: pDay.dateStr,
        actualBalance: currentBal,
        actualSpend: cumulativeSpend,
        projectedBalance: currentBal, // Anchor point for visual continuity
      });
    }

    // Future slope projection: project from today down to 0 balance using dailyVelocity
    const currentActualBal = Math.max(0, remainingBudget);
    let projBal = currentActualBal;
    const projSteps = Math.min(daysRemaining > 0 ? daysRemaining : 1, 30);

    for (let i = 1; i <= projSteps; i += Math.max(1, Math.floor(projSteps / 7))) {
      const futureDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      const fStr = futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      projBal = Math.max(0, currentActualBal - i * dailyVelocity);

      chartData.push({
        date: fStr,
        actualBalance: null, // Solid line ends at present date
        projectedBalance: Math.round(projBal),
      });
    }

    return res.json({
      analytics: {
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
      },
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    return res.status(500).json({ message: 'Failed to compute analytics', error: error.message });
  }
};
