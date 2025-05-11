import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import BudgetCard from '../components/expenses/BudgetCard';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseTable from '../components/expenses/ExpenseTable';
import DashboardStats from '../components/expenses/DashboardStats';
import { useExpense } from '../contexts/ExpenseContext';
import { BarChart, PieChart, DollarSign, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { isLoading } = useExpense();
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-purple-900/20 mb-4 flex items-center justify-center">
              <BarChart className="h-8 w-8 text-purple-700" />
            </div>
            <p className="text-lg text-gray-700">Loading your financial data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-700 to-black bg-clip-text text-transparent">
            Financial Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Track and manage your campus expenses</p>
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
        
        <div className="rounded-xl bg-white shadow-md p-6 border border-gray-200 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-800">Expense History</h2>
            </div>
            <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
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
