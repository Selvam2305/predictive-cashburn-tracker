import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import CashBurnBanner from './components/CashBurnBanner';
import NeedsReviewCarousel from './components/NeedsReviewCarousel';
import CashBurnChart from './components/CashBurnChart';
import CategoryBreakdown from './components/CategoryBreakdown';
import ExpenseList from './components/ExpenseList';
import CSVUploadModal from './components/CSVUploadModal';
import AddExpenseModal from './components/AddExpenseModal';
import LoginPage from './components/LoginPage';

export default function App() {
  const { token, user } = useAuth();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (!token || !user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAdd={() => setIsAddOpen(true)}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 1. High-Visibility Forecasted Zero Date Alert Banner */}
        <CashBurnBanner />

        {/* 2. Needs Review 1-Tap Smart Carousel (Unremembered Micro-Spends) */}
        <NeedsReviewCarousel />

        {/* 3. Unified Recharts Mathematical Extrapolation Slope Chart */}
        <CashBurnChart />

        {/* 4. Touch Category Isolation Cards */}
        <CategoryBreakdown
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* 5. Searchable Transaction History & Layer 2 Retagging Table */}
        <ExpenseList
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500 font-mono">
        Predictive Cash-Burn Analytics Platform &copy; 2026. Zero-Disk RAM File Buffer & 4-Layer Regex Engine.
      </footer>

      {/* Modals */}
      <CSVUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      <AddExpenseModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
