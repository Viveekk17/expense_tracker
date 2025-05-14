import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '../hooks/use-toast';
import * as awsExpenseService from '../services/awsExpenseService';
import { isAuthenticated, getCurrentUser } from '../services/awsAuthService';

export interface Expense {
  expenseId: string;
  userId: string;
  amount: number;
  category: string;
  date: string;
  description: string;
}

export interface UserDetails {
  userId: string;
  email: string;
  monthlyBudget: number;
  createdAt: string;
}

interface ExpenseContextType {
  expenses: Expense[];
  userDetails: UserDetails | null;
  categories: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  setMonthlyBudget: (budget: number) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'userId' | 'expenseId'>) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  generateReport: () => Promise<string>;
  totalSpent: number;
  remainingBudget: number;
}

const defaultCategories = [
  'Food', 
  'Travel', 
  'Rent', 
  'Stationery', 
  'Utilities', 
  'Entertainment',
  'Clothing',
  'Health',
  'Education',
  'Other'
];

const ExpenseContext = createContext<ExpenseContextType>({
  expenses: [],
  userDetails: null,
  categories: defaultCategories,
  isLoading: true,
  isAuthenticated: false,
  setMonthlyBudget: async () => {},
  addExpense: async () => {},
  deleteExpense: async () => {},
  generateReport: async () => '',
  totalSpent: 0,
  remainingBudget: 0
});

export const useExpense = () => useContext(ExpenseContext);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authStatus, setAuthStatus] = useState<boolean>(false);
  const { toast } = useToast();

  // Calculate total spent and remaining budget
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = userDetails ? userDetails.monthlyBudget - totalSpent : 0;

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      setIsLoading(true);
      try {
        // Check if user is authenticated
        const authenticated = await isAuthenticated();
        setAuthStatus(authenticated);

        if (authenticated) {
          // Get user details
          const userInfo = await awsExpenseService.getUserDetails();
          
          if (userInfo) {
            setUserDetails(userInfo);
          } else {
            // If user exists in Cognito but not in DynamoDB, create a record
            try {
              const user = await getCurrentUser();
              console.log('Full current user data:', user);
              
              if (user) {
                // Try different ways to get the email
                let email = '';
                if (user.signInDetails?.loginId) {
                  email = user.signInDetails.loginId;
                } else if (user.username) {
                  // Use username as a fallback if it looks like an email
                  email = user.username.includes('@') ? user.username : `${user.username}@example.com`;
                } else {
                  // Last resort fallback
                  email = `user_${Date.now()}@example.com`;
                }
                
                console.log('Creating user with email:', email);
                const newUser = await awsExpenseService.createUser(email);
                setUserDetails(newUser);
              }
            } catch (userError) {
              console.error('Error getting or creating user:', userError);
              toast({
                title: "User profile error",
                description: "Could not create user profile. Please try logging out and back in.",
                variant: "destructive",
              });
            }
          }

          // Fetch expenses
          const userExpenses = await awsExpenseService.getExpenses();
          setExpenses(userExpenses);
        } else {
          // Reset state if not authenticated
          setUserDetails(null);
          setExpenses([]);
        }
      } catch (error: any) {
        toast({
          title: "Error loading data",
          description: error.message || "Failed to load data. Please try again.",
          variant: "destructive",
        });
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [toast, authStatus]);

  const setMonthlyBudget = async (budget: number) => {
    try {
      const updatedUser = await awsExpenseService.updateUserBudget(budget);
      setUserDetails(updatedUser);
      toast({
        title: "Budget updated",
        description: `Your monthly budget has been set to ₹${budget}.`,
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error updating budget",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const addExpense = async (expenseData: Omit<Expense, 'userId' | 'expenseId'>) => {
    try {
      const newExpense = await awsExpenseService.addExpense(expenseData);
      setExpenses(prev => [...prev, newExpense]);
      toast({
        title: "Expense added",
        description: `₹${newExpense.amount} expense has been recorded.`,
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error adding expense",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteExpense = async (expenseId: string) => {
    try {
      await awsExpenseService.deleteExpense(expenseId);
      setExpenses(prev => prev.filter(exp => exp.expenseId !== expenseId));
      toast({
        title: "Expense deleted",
        description: "The expense has been removed successfully.",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting expense",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const generateReport = async () => {
    if (expenses.length === 0) {
      toast({
        title: "Cannot generate report",
        description: "No expenses found.",
        variant: "destructive",
      });
      return '';
    }

    try {
      const reportUrl = await awsExpenseService.generateReportUrl();
      
      toast({
        title: "Report generated",
        description: "Your expense report is ready to download.",
        variant: "default",
      });
      
      return reportUrl;
    } catch (error: any) {
      toast({
        title: "Error generating report",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    expenses,
    userDetails,
    categories: defaultCategories,
    isLoading,
    isAuthenticated: authStatus,
    setMonthlyBudget,
    addExpense,
    deleteExpense,
    generateReport,
    totalSpent,
    remainingBudget
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};
