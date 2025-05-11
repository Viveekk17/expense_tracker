
import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import BudgetCard from '../components/expenses/BudgetCard';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseTable from '../components/expenses/ExpenseTable';
import DashboardStats from '../components/expenses/DashboardStats';
import { useExpense } from '../contexts/ExpenseContext';

const Dashboard = () => {
  const { isLoading } = useExpense();
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-lg">Loading your data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Expense Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BudgetCard />
          <ExpenseForm />
        </div>
        
        <DashboardStats />
        
        <ExpenseTable />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
