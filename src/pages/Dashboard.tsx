import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import BudgetCard from '../components/expenses/BudgetCard';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseTable from '../components/expenses/ExpenseTable';
import DashboardStats from '../components/expenses/DashboardStats';
import { useExpense } from '../contexts/ExpenseContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BarChart, PieChart, Calendar, Wallet, TrendingUp, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { isLoading } = useExpense();
  const { theme } = useTheme();
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 dark:bg-primary/10 mb-4 flex items-center justify-center">
              <BarChart className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg text-foreground dark:text-gray-300">Loading your financial data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="space-y-8 p-6">
        {/* Header Section */}
        <div className="dashboard-header bg-gradient-to-r from-primary/5 to-purple-500/5 dark:from-primary/10 dark:to-purple-500/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="dashboard-title text-4xl mb-2">
                Financial Dashboard
              </h1>
              <p className="dashboard-subtitle text-lg">Track and manage your campus expenses</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-primary/10 dark:bg-primary/20 px-4 py-2 rounded-lg">
                <Wallet className="h-5 w-5 text-primary" />
                <span className="text-primary font-medium">Student Budget</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="dashboard-card transform hover:scale-[1.02] transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-card-foreground dark:text-gray-200">Budget Overview</h2>
                  <div className="dashboard-badge">
                    <TrendingUp className="h-4 w-4 mr-1 inline" />
                    Monthly
                  </div>
                </div>
                <BudgetCard />
              </div>
            </div>
            
            <div className="dashboard-card transform hover:scale-[1.02] transition-all duration-300 bg-white dark:bg-gray-800/50">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-card-foreground dark:text-gray-200">Expense Analytics</h2>
                  <div className="dashboard-badge">
                    <PieChart className="h-4 w-4 mr-1 inline" />
                    Statistics
                  </div>
                </div>
                <DashboardStats />
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="dashboard-card transform hover:scale-[1.02] transition-all duration-300 bg-white dark:bg-gray-800/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-card-foreground dark:text-gray-200">Add New Expense</h2>
                <div className="dashboard-badge">
                  <AlertCircle className="h-4 w-4 mr-1 inline" />
                  Quick Add
                </div>
              </div>
              <ExpenseForm />
            </div>
          </div>
        </div>
        
        {/* Expense History Section */}
        <div className="dashboard-card transform hover:scale-[1.02] transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-card-foreground dark:text-gray-200">Expense History</h2>
              </div>
              <div className="dashboard-badge text-base px-4 py-2">
                All transactions
              </div>
            </div>
            <ExpenseTable />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
