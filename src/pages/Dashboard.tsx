import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import BudgetCard from '../components/expenses/BudgetCard';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseTable from '../components/expenses/ExpenseTable';
import DashboardStats from '../components/expenses/DashboardStats';
import { useExpense } from '../contexts/ExpenseContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BarChart, PieChart, DollarSign, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { isLoading } = useExpense();
  const { theme } = useTheme();
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 mb-4 flex items-center justify-center">
              <BarChart className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg text-foreground">Loading your financial data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="border-b border-border pb-4 mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Financial Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Track and manage your campus expenses</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="transform transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg">
              <BudgetCard />
            </div>
            <DashboardStats />
          </div>
          <div className="transform transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg">
            <ExpenseForm />
          </div>
        </div>
        
        <div className="rounded-xl bg-card dark:bg-card shadow-md p-6 border border-border mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-card-foreground">Expense History</h2>
            </div>
            <div className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              All transactions
            </div>
          </div>
          <ExpenseTable />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
