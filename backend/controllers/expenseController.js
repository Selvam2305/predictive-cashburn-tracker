import Expense from '../models/Expense.js';
import MerchantRule from '../models/MerchantRule.js';
import { categorizeTransaction } from '../utils/categorizer.js';

export const getExpenses = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Uses compound index { userId: 1, timestamp: -1 } for fast retrieval
    const expenses = await Expense.find({ userId }).sort({ timestamp: -1 });
    return res.json({ expenses });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching expenses', error: error.message });
  }
};

export const addExpense = async (req, res) => {
  try {
    const userId = req.user.userId;
    let { amount, description, category, timestamp } = req.body;

    if (!amount || !description) {
      return res.status(400).json({ message: 'Amount and description are required' });
    }

    const parsedDate = timestamp ? new Date(timestamp) : new Date();

    // Fetch user merchant rules for Layer 2 evaluation
    const userRules = await MerchantRule.find({ userId });

    let finalCategory = category;
    let protocol = 'DIRECT';
    let isNeedsReview = false;

    if (!category || category === 'Auto-Detect') {
      const result = categorizeTransaction(description, Number(amount), parsedDate, userRules);
      finalCategory = result.category;
      protocol = result.protocol;
      isNeedsReview = result.isNeedsReview;
    }

    const expense = await Expense.create({
      userId,
      amount: Number(amount),
      description: description.trim(),
      category: finalCategory,
      timestamp: parsedDate,
      protocol,
      isNeedsReview,
    });

    return res.status(201).json({ expense });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add expense', error: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    return res.json({ message: 'Expense deleted successfully', id });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete expense', error: error.message });
  }
};

/**
 * Universal RAM Streaming CSV Ingestion Endpoint (Zero Server Disk Writes)
 * Supports all Indian & global bank exports (HDFC, ICICI, SBI, Paytm, GPay, etc.)
 */
export const uploadCSV = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No CSV file provided' });
    }

    const userId = req.user.userId;
    const csvContent = req.file.buffer.toString('utf-8');

    const rawLines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (rawLines.length === 0) {
      return res.status(400).json({ message: 'CSV file is empty' });
    }

    // Determine delimiter
    const firstLine = rawLines[0];
    let delimiter = ',';
    if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';
    else if (firstLine.includes('\t') && !firstLine.includes(',')) delimiter = '\t';

    // Parse CSV line respecting quotes
    const parseCSVLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map((cell) => cell.replace(/^"|"$/g, '').trim());
    };

    // Find Header Row
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

    // Map Header Column Indices
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

    // Heuristic Column Fallback if headers were unmapped
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

    // Fetch Layer 2 User Merchant Rules
    const userRules = await MerchantRule.find({ userId });
    const bulkOperations = [];
    let processedCount = 0;

    for (const cells of dataRows) {
      const rawDesc = cells[descIdx] || '';
      const rawAmount = cells[amountIdx] || '0';
      const rawDate = cells[dateIdx] || new Date().toISOString();

      const numAmount = Math.abs(parseFloat(rawAmount.replace(/[^0-9.-]+/g, '')) || 0);

      if (!rawDesc || rawDesc.trim().length === 0 || numAmount <= 0) continue;

      const parsedDate = new Date(rawDate);
      const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

      // Execute 4-Layer Categorization Engine
      const catResult = categorizeTransaction(rawDesc, numAmount, validDate, userRules);

      bulkOperations.push({
        insertOne: {
          document: {
            userId,
            amount: numAmount,
            description: rawDesc.trim(),
            category: catResult.category,
            timestamp: validDate,
            protocol: catResult.protocol,
            isNeedsReview: catResult.isNeedsReview,
            suggestedCategory: catResult.suggestedCategory || '',
            confidence: catResult.confidence || 1.0,
          },
        },
      });

      processedCount++;
    }

    if (bulkOperations.length > 0) {
      await Expense.bulkWrite(bulkOperations);
    }

    const updatedExpenses = await Expense.find({ userId }).sort({ timestamp: -1 });

    return res.status(200).json({
      message: `Successfully processed ${processedCount} transactions in RAM streaming buffer!`,
      processedCount,
      expenses: updatedExpenses,
    });
  } catch (error) {
    console.error('CSV Upload Error:', error);
    return res.status(500).json({ message: 'CSV processing failed', error: error.message });
  }
};

/**
 * Re-tags an expense & saves Layer 2 Merchant Rule to MongoDB for future auto-tagging
 */
export const reTagExpense = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { newCategory } = req.body;

    if (!newCategory) {
      return res.status(400).json({ message: 'New category is required' });
    }

    const expense = await Expense.findOne({ _id: id, userId });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.category = newCategory;
    expense.isNeedsReview = false;
    await expense.save();

    // Layer 2 Auto-Learning: Save rule for merchant pattern
    const pattern = extractMerchantPattern(expense.description);
    if (pattern && pattern.length >= 3) {
      await MerchantRule.findOneAndUpdate(
        { userId, merchantPattern: pattern },
        { category: newCategory },
        { upsert: true, new: true }
      );

      // Auto-tag all existing matching past transactions for this user!
      await Expense.updateMany(
        {
          userId,
          description: { $regex: pattern, $options: 'i' },
        },
        {
          category: newCategory,
          isNeedsReview: false,
        }
      );
    }

    const allExpenses = await Expense.find({ userId }).sort({ timestamp: -1 });

    return res.json({
      message: `Updated category to "${newCategory}" and saved merchant rule for future transactions!`,
      expense,
      expenses: allExpenses,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retag expense', error: error.message });
  }
};

function extractMerchantPattern(desc) {
  if (!desc) return '';
  let cleaned = desc.replace(/UPI\/(P2P|P2M)\//gi, '').replace(/[0-9\/]+/g, ' ').trim();
  const parts = cleaned.split(/\s+/).filter((p) => p.length > 2);
  return parts[0] || desc.substring(0, 10);
}
