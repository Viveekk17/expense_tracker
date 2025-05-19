import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import BudgetCard from '../components/expenses/BudgetCard';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseTable from '../components/expenses/ExpenseTable';
import { DashboardStats } from '../components/expenses/DashboardStats';
import { ExpenseAnalytics } from '../components/expenses/ExpenseAnalytics';
import { useExpense } from '../contexts/ExpenseContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BarChart, PieChart, Calendar, Wallet, TrendingUp, AlertCircle, LayoutDashboard, Plus, List } from 'lucide-react';
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
      <div className="space-y-4 sm:space-y-8 p-3 sm:p-6">
        {/* Greeting Message */}
        {showGreeting && (
          <div className="fixed top-[120px] sm:top-[64px] left-1/2 -translate-x-1/2 z-50 animate-fade-in-out w-full flex justify-center px-2">
            <div className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg backdrop-blur-sm max-w-[95vw] sm:max-w-none text-xs sm:text-base font-medium text-center
              ${userDetails?.monthlyBudget && (totalSpent / userDetails.monthlyBudget) * 100 > 100
                ? 'bg-red-500/90 dark:bg-red-500/80'
                : 'bg-primary/90 dark:bg-primary/80'} text-white`}>
              {greetingMessage}
            </div>
          </div>
        )}
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-8">
          <div>
            <h1 className="dashboard-title text-2xl sm:text-4xl mb-1 sm:mb-2">
              Financial Dashboard
            </h1>
            <p className="dashboard-subtitle text-base sm:text-lg">Track and manage your campus expenses</p>
          </div>
          <div className="mt-2 sm:mt-0 w-full sm:w-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex w-full sm:w-[340px] bg-transparent border-b-2 border-[#232b3b]">
                <TabsTrigger
                  value="dashboard"
                  className={
                    `relative flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 font-semibold text-sm sm:text-base transition-all duration-200 border-b-2 ` +
                    (activeTab === 'dashboard'
                      ? 'text-primary border-primary'
                      : 'text-gray-400 border-transparent hover:text-primary')
                  }
                  style={{ transition: 'border-color 0.3s, color 0.3s' }}
                >
                  <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Dashboard</span>
                  {activeTab === 'dashboard' && (
                    <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary rounded transition-all duration-300" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className={
                    `relative flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2 font-semibold text-sm sm:text-base transition-all duration-200 border-b-2 ` +
                    (activeTab === 'analytics'
                      ? 'text-primary border-primary'
                      : 'text-gray-400 border-transparent hover:text-primary')
                  }
                  style={{ transition: 'border-color 0.3s, color 0.3s' }}
                >
                  <BarChart className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Analytics</span>
                  {activeTab === 'analytics' && (
                    <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary rounded transition-all duration-300" />
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-8">
          <TabsContent value="dashboard" className="space-y-4 sm:space-y-8 m-0">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              {/* Left Column - Budget Overview and Analytics */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                {/* Budget Overview Card */}
                <div className="dashboard-card transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h2 className="text-lg sm:text-xl font-semibold text-card-foreground dark:text-gray-200">Budget Overview</h2>
                      <div className="dashboard-badge text-xs sm:text-sm">
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 inline" />
                        Monthly
                      </div>
                    </div>
                    <BudgetCard />
                  </div>
                </div>
                
                {/* Expense Analytics Card */}
                <div className="dashboard-card transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300 bg-white dark:bg-gray-800/50">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h2 className="text-lg sm:text-xl font-semibold text-card-foreground dark:text-gray-200">Expense Analytics</h2>
                      <div className="dashboard-badge text-xs sm:text-sm">
                        <PieChart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 inline" />
                        Statistics
                      </div>
                    </div>
                    <DashboardStats />
                  </div>
                </div>
              </div>
              
              {/* Right Column - Add Expense Form */}
              <div className="lg:col-span-5">
                <div className="dashboard-card sticky top-4 sm:top-8">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h2 className="text-lg sm:text-xl font-semibold text-card-foreground dark:text-gray-200">Add Expense</h2>
                      <div className="dashboard-badge text-xs sm:text-sm">
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 inline" />
                        New Entry
                      </div>
                    </div>
                    <ExpenseForm />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Expense Table Section */}
            <div className="mt-4 sm:mt-8">
              <div className="dashboard-card">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-card-foreground dark:text-gray-200">Recent Expenses</h2>
                    <div className="dashboard-badge text-xs sm:text-sm">
                      <List className="h-3 w-3 sm:h-4 sm:w-4 mr-1 inline" />
                      History
                    </div>
                  </div>
                  <ExpenseTable />
                </div>
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
