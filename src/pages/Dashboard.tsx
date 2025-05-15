import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import BudgetCard from '../components/expenses/BudgetCard';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseTable from '../components/expenses/ExpenseTable';
import { DashboardStats } from '../components/expenses/DashboardStats';
import { ExpenseAnalytics } from '../components/expenses/ExpenseAnalytics';
import { useExpense } from '../contexts/ExpenseContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BarChart, PieChart, Calendar, Wallet, TrendingUp, AlertCircle, LayoutDashboard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const Dashboard = () => {
  const { isLoading, userDetails, totalSpent } = useExpense();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showGreeting, setShowGreeting] = useState(true);
  const [greetingMessage, setGreetingMessage] = useState('');
  
  useEffect(() => {
    if (userDetails?.monthlyBudget) {
      const budgetPercentage = (totalSpent / userDetails.monthlyBudget) * 100;
      
      if (budgetPercentage > 100) {
        setGreetingMessage(`Hi ${userDetails.email?.split('@')[0]}! You've exceeded your budget by ${Math.round(budgetPercentage - 100)}%! ⚠️`);
      } else if (budgetPercentage >= 100) {
        setGreetingMessage(`Hi ${userDetails.email?.split('@')[0]}! You've reached your budget limit! 🎯`);
      } else if (budgetPercentage >= 75) {
        setGreetingMessage(`Hi ${userDetails.email?.split('@')[0]}! You've used ${Math.round(budgetPercentage)}% of your budget! 👀`);
      } else if (budgetPercentage >= 50) {
        setGreetingMessage(`Hi ${userDetails.email?.split('@')[0]}! You're halfway through your budget! 💪`);
      } else {
        setGreetingMessage(`Hi ${userDetails.email?.split('@')[0]}! All expenses in control! 😉`);
      }
    } else {
      setGreetingMessage(`Hi ${userDetails?.email?.split('@')[0]}! Welcome to your expense tracker! 👋`);
    }
  }, [userDetails, totalSpent]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGreeting(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);
  
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
        {/* Greeting Message */}
        {showGreeting && (
          <div className="fixed top-[150px] sm:top-[64px] left-1/2 -translate-x-1/2 z-50 animate-fade-in-out w-full flex justify-center px-2">
            <div className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg backdrop-blur-sm max-w-[95vw] sm:max-w-none text-xs sm:text-lg font-medium text-center
              ${userDetails?.monthlyBudget && (totalSpent / userDetails.monthlyBudget) * 100 > 100
                ? 'bg-red-500/90 dark:bg-red-500/80'
                : 'bg-primary/90 dark:bg-primary/80'} text-white`}>
              {greetingMessage}
            </div>
          </div>
        )}
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="dashboard-title text-4xl mb-2">
              Financial Dashboard
            </h1>
            <p className="dashboard-subtitle text-lg">Track and manage your campus expenses</p>
          </div>
          <div className="mt-4 sm:mt-0 w-full sm:w-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex w-full sm:w-[340px] bg-transparent border-b-2 border-[#232b3b]">
                <TabsTrigger
                  value="dashboard"
                  className={
                    `relative flex-1 flex items-center justify-center gap-2 px-6 py-2 font-semibold text-base transition-all duration-200 border-b-2 ` +
                    (activeTab === 'dashboard'
                      ? 'text-primary border-primary'
                      : 'text-gray-400 border-transparent hover:text-primary')
                  }
                  style={{ transition: 'border-color 0.3s, color 0.3s' }}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                  {activeTab === 'dashboard' && (
                    <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary rounded transition-all duration-300" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className={
                    `relative flex-1 flex items-center justify-center gap-2 px-6 py-2 font-semibold text-base transition-all duration-200 border-b-2 ` +
                    (activeTab === 'analytics'
                      ? 'text-primary border-primary'
                      : 'text-gray-400 border-transparent hover:text-primary')
                  }
                  style={{ transition: 'border-color 0.3s, color 0.3s' }}
                >
                  <BarChart className="h-5 w-5" />
                  <span>Analytics</span>
                  {activeTab === 'analytics' && (
                    <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary rounded transition-all duration-300" />
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsContent value="dashboard" className="space-y-8 m-0">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column - Budget Overview and Analytics */}
              <div className="lg:col-span-7 space-y-6">
                {/* Budget Overview Card */}
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
                
                {/* Expense Analytics Card */}
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
              
              {/* Right Column - Add Expense Form */}
              <div className="lg:col-span-5">
                <div className="dashboard-card transform hover:scale-[1.02] transition-all duration-300 bg-white dark:bg-gray-800/50 sticky top-6">
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
            </div>
            
            {/* Expense History Section - Full Width */}
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
          </TabsContent>
          
          {/* Analytics Tab Content */}
          <TabsContent value="analytics" className="m-0">
            <div className="dashboard-card bg-white dark:bg-gray-800/50 p-6">
              <ExpenseAnalytics />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
