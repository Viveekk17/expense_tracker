import { get, post, put, del } from 'aws-amplify/api';
import { getCurrentUser } from './awsAuthService';

const API_NAME = 'CampusExpenseCompassAPI';

// Detect if running in a mobile environment
const isMobileApp = (): boolean => {
  return typeof window !== 'undefined' && 
         (window.navigator.userAgent.includes('Android') || 
          window.navigator.userAgent.includes('iPhone') ||
          document.URL.indexOf('http://') === -1 && 
          document.URL.indexOf('https://') === -1);
};

// Local storage functions
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

const getFromLocalStorage = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

// Sync data from local to AWS in background
const syncToAWS = async (operation: () => Promise<any>) => {
  try {
    await operation();
    return true;
  } catch (error) {
    console.error('Background sync error:', error);
    return false;
  }
};

export interface User {
  userId: string;
  email: string;
  monthlyBudget: number;
  createdAt: string;
}

export interface Expense {
  expenseId: string;
  userId: string;
  amount: number;
  category: string;
  date: string;
  description: string;
}

// User operations
export const createUser = async (email: string): Promise<User> => {
  try {
    console.log('Starting createUser with email:', email);
    
    const currentUser = await getCurrentUser();
    console.log('Current user for createUser:', currentUser);
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const userId = currentUser.username;
    console.log('Using userId for createUser:', userId);
    
    const newUser = {
      userId,
      email,
      monthlyBudget: 0,
      createdAt: new Date().toISOString()
    };

    // First save to localStorage for immediate access
    saveToLocalStorage(`user_${userId}`, newUser);
    console.log('Created user in localStorage:', newUser);
    
    // Then try AWS in background
    syncToAWS(async () => {
      const operation = post({
        apiName: API_NAME,
        path: '/users',
        options: {
          body: newUser,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      });
      await operation.response;
      console.log('User also synced to AWS');
    });
    
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUserBudget = async (monthlyBudget: number): Promise<User> => {
  try {
    console.log('Starting updateUserBudget with budget:', monthlyBudget);
    
    const currentUser = await getCurrentUser();
    console.log('Current user:', currentUser);
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const userId = currentUser.username;
    console.log('Using userId:', userId);
    
    // First update in localStorage
    const userKey = `user_${userId}`;
    let userData = getFromLocalStorage(userKey) as User | null;
    
    if (!userData) {
      // Create new user data if it doesn't exist
      userData = {
        userId,
        email: currentUser.signInDetails?.loginId || `${userId}@example.com`,
        monthlyBudget,
        createdAt: new Date().toISOString()
      };
    } else {
      // Update existing user data
      userData.monthlyBudget = monthlyBudget;
    }
    
    saveToLocalStorage(userKey, userData);
    console.log('Updated user budget in localStorage:', userData);
    
    // Then sync to AWS in background
    syncToAWS(async () => {
      const operation = put({
        apiName: API_NAME,
        path: `/users/${userId}`,
        options: {
          body: { monthlyBudget },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      });
      await operation.response;
      console.log('Budget also synced to AWS');
    });
    
    return userData;
  } catch (error) {
    console.error('Error updating user budget:', error);
    throw error;
  }
};

export const getUserDetails = async (): Promise<User | null> => {
  try {
    console.log('Getting user details...');
    
    const currentUser = await getCurrentUser();
    console.log('Current user for details:', currentUser);
    
    if (!currentUser) {
      console.log('No current user found.');
      return null;
    }

    const userId = currentUser.username;
    console.log('Using userId for details:', userId);
    
    // First check localStorage
    const userData = getFromLocalStorage(`user_${userId}`) as User | null;
    if (userData) {
      console.log('Found user data in localStorage:', userData);
      
      // Fetch from AWS in background to keep data fresh
      syncToAWS(async () => {
        const operation = get({
          apiName: API_NAME,
          path: `/users/${userId}`,
          options: {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        });
        
        const response = await operation.response;
        if (response.body) {
          const awsUserData = JSON.parse(JSON.stringify(response.body)) as User;
          saveToLocalStorage(`user_${userId}`, awsUserData);
          console.log('Updated user data from AWS in background');
        }
      });
      
      return userData;
    }
    
    // If not in local storage, try AWS
    console.log('No data in localStorage, trying AWS API...');
    try {
      const operation = get({
        apiName: API_NAME,
        path: `/users/${userId}`,
        options: {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      });
      
      console.log('User details operation created, awaiting response...');
      const response = await operation.response;
      console.log('User details response received:', response);
      
      if (!response.body) {
        console.log('No user details found in response');
        return null;
      }
      
      const fetchedUserData = JSON.parse(JSON.stringify(response.body)) as User;
      // Save to localStorage for future access
      saveToLocalStorage(`user_${userId}`, fetchedUserData);
      return fetchedUserData;
    } catch (apiError) {
      console.error('API call error for user details:', apiError);
      return null;
    }
  } catch (error) {
    console.error('Error getting user details:', error);
    return null;
  }
};

// Expense operations
export const addExpense = async (expense: Omit<Expense, 'userId' | 'expenseId'>): Promise<Expense> => {
  try {
    console.log('Starting addExpense with data:', expense);
    
    const currentUser = await getCurrentUser();
    console.log('Current user for expense:', currentUser);
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const userId = currentUser.username;
    console.log('Using userId for expense:', userId);
    
    const expenseId = Date.now().toString(); // Generate a unique ID
    const newExpense = {
      ...expense,
      userId,
      expenseId
    };

    // First save to localStorage for immediate access
    const expensesKey = `expenses_${userId}`;
    const existingExpenses = getFromLocalStorage(expensesKey) as Expense[] || [];
    existingExpenses.push(newExpense);
    saveToLocalStorage(expensesKey, existingExpenses);
    console.log('Added expense to localStorage:', newExpense);
    
    // Then sync to AWS in background
    syncToAWS(async () => {
      const operation = post({
        apiName: API_NAME,
        path: '/expenses',
        options: {
          body: newExpense,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      });
      await operation.response;
      console.log('Expense also synced to AWS');
    });
    
    return newExpense;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

export const getExpenses = async (): Promise<Expense[]> => {
  try {
    console.log('Getting expenses list...');
    
    const currentUser = await getCurrentUser();
    console.log('Current user for expense list:', currentUser);
    
    if (!currentUser) {
      console.log('No current user found, returning empty expense list.');
      return [];
    }

    const userId = currentUser.username;
    console.log('Using userId for expense list:', userId);
    
    // First check localStorage
    const expensesData = getFromLocalStorage(`expenses_${userId}`) as Expense[] | null;
    if (expensesData) {
      console.log('Found expenses data in localStorage:', expensesData);
      
      // Fetch from AWS in background to keep data fresh
      syncToAWS(async () => {
        const operation = get({
          apiName: API_NAME,
          path: `/expenses/user/${userId}`,
          options: {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        });
        
        const response = await operation.response;
        if (response.body) {
          const awsExpenses = JSON.parse(JSON.stringify(response.body)) as Expense[];
          saveToLocalStorage(`expenses_${userId}`, awsExpenses);
          console.log('Updated expenses from AWS in background');
        }
      });
      
      return expensesData;
    }
    
    // If not in local storage, try AWS
    console.log('No data in localStorage, trying AWS API...');
    try {
      const operation = get({
        apiName: API_NAME,
        path: `/expenses/user/${userId}`,
        options: {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      });
      
      console.log('Expenses list operation created, awaiting response...');
      const response = await operation.response;
      console.log('Expenses list response received:', response);
      
      if (!response.body) {
        console.log('No expenses found in response');
        return [];
      }
      
      const expenses = JSON.parse(JSON.stringify(response.body)) as Expense[];
      // Save to localStorage for future access
      saveToLocalStorage(`expenses_${userId}`, expenses);
      return expenses;
    } catch (apiError) {
      console.error('API call error for expenses list:', apiError);
      return [];
    }
  } catch (error) {
    console.error('Error getting expenses:', error);
    return [];
  }
};

export const generateReportUrl = async (): Promise<string> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const userId = currentUser.username;
    console.log('Generating report for user:', userId);
    
    // Generate CSV from local storage first for speed
    const expenses = getFromLocalStorage(`expenses_${userId}`) as Expense[] || [];
    
    // Add BOM for Excel to correctly identify UTF-8
    const BOM = '\uFEFF';
    // Generate CSV content - Excel needs a specific date format
    const headers = 'Date,Amount,Category,Description\n';
    
    // Format dates properly for Excel - using numbers with slashes
    const rows = expenses.map(expense => {
      let formattedDate = '';
      try {
        const date = new Date(expense.date);
        // Format as MM/DD/YYYY without quotes, which Excel recognizes as a date
        formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
      } catch (e) {
        console.error('Date formatting error:', e);
        formattedDate = expense.date; // fallback
      }
      
      return `${formattedDate},${expense.amount},${expense.category},"${expense.description || ''}"`;
    }).join('\n');
    
    const csvContent = BOM + headers + rows;
    
    // Handle mobile and web differently
    if (isMobileApp()) {
      console.log('Running in mobile environment, using alternative export method');
      
      // For Android, we'll return the CSV content directly instead of a URL
      // The calling component will need to handle this differently
      return JSON.stringify({
        fileName: `expense-report-${userId}-${new Date().toISOString().split('T')[0]}.csv`,
        mimeType: 'text/csv;charset=utf-8;',
        content: csvContent,
        isMobile: true
      });
    } else {
      // Web browser approach - create a Blob URL
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Try AWS in background but don't wait for it
      syncToAWS(async () => {
        const operation = get({
          apiName: API_NAME,
          path: `/reports/${userId}`,
          options: {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        });
        await operation.response;
      });
      
      // Return the local URL immediately
      return url;
    }
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

export const deleteExpense = async (expenseId: string): Promise<void> => {
  try {
    console.log('Starting deleteExpense for expenseId:', expenseId);
    
    const currentUser = await getCurrentUser();
    console.log('Current user for expense deletion:', currentUser);
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const userId = currentUser.username;
    console.log('Using userId for expense deletion:', userId);
    
    // First delete from localStorage
    const expensesKey = `expenses_${userId}`;
    const existingExpenses = getFromLocalStorage(expensesKey) as Expense[] || [];
    const updatedExpenses = existingExpenses.filter(exp => exp.expenseId !== expenseId);
    saveToLocalStorage(expensesKey, updatedExpenses);
    console.log('Deleted expense from localStorage');
    
    // Then sync to AWS in background
    syncToAWS(async () => {
      const operation = del({
        apiName: API_NAME,
        path: `/expenses/${expenseId}`,
        options: {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      });
      await operation.response;
      console.log('Expense deletion also synced to AWS');
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
}; 