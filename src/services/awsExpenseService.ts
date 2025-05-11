import { get, post, put, del } from 'aws-amplify/api';
import { getCurrentUser } from './awsAuthService';

const API_NAME = 'CampusExpenseCompassAPI';

// Local storage fallback functions
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

    console.log('Making API POST request to create user:', newUser);
    
    try {
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
      
      console.log('Create user operation created, awaiting response...');
      const response = await operation.response;
      console.log('Create user response received:', response);
      
      return JSON.parse(JSON.stringify(response.body)) as User;
    } catch (apiError) {
      console.error('API call error for creating user:', apiError);
      console.log('Falling back to localStorage for user creation');
      
      // Save to localStorage as fallback
      saveToLocalStorage(`user_${userId}`, newUser);
      console.log('Created user in localStorage:', newUser);
      
      return newUser;
    }
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
    
    console.log('Making API PUT request to:', `/users/${userId}`);
    console.log('Request body:', { monthlyBudget });
    console.log('Using API name:', API_NAME);
    
    // Try adding the content type explicitly
    try {
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
      
      console.log('Operation created, awaiting response...');
      const response = await operation.response;
      console.log('Response received:', response);
      
      if (!response.body) {
        throw new Error('No response body received from API');
      }
      
      return JSON.parse(JSON.stringify(response.body)) as User;
    } catch (apiError) {
      console.error('API call error:', apiError);
      console.log('Falling back to localStorage for budget update');
      
      // Fallback to localStorage
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
      return userData;
    }
  } catch (error) {
    console.error('Detailed error updating user budget:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
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
    
    console.log('Making API GET request for user details:', `/users/${userId}`);
    
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
        throw new Error('No user details found in API response');
      }
      
      const userData = JSON.parse(JSON.stringify(response.body)) as User;
      // Also save to localStorage for offline access
      saveToLocalStorage(`user_${userId}`, userData);
      return userData;
    } catch (apiError) {
      console.error('API call error for user details:', apiError);
      console.log('Checking localStorage for user data');
      
      // Try localStorage
      const userData = getFromLocalStorage(`user_${userId}`) as User | null;
      if (userData) {
        console.log('Found user data in localStorage:', userData);
        return userData;
      }
      
      console.log('No user data found in localStorage either. Returning null.');
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

    console.log('Making API POST request to add expense:', newExpense);
    
    try {
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
      
      console.log('Expense operation created, awaiting response...');
      const response = await operation.response;
      console.log('Expense response received:', response);
      
      if (!response.body) {
        throw new Error('No response body received from API');
      }
      
      return JSON.parse(JSON.stringify(response.body)) as Expense;
    } catch (apiError) {
      console.error('API call error for expense:', apiError);
      console.log('Falling back to localStorage for expense tracking');
      
      // Fallback to localStorage
      const expensesKey = `expenses_${userId}`;
      const existingExpenses = getFromLocalStorage(expensesKey) as Expense[] || [];
      
      // Add the new expense
      existingExpenses.push(newExpense);
      saveToLocalStorage(expensesKey, existingExpenses);
      
      console.log('Added expense to localStorage:', newExpense);
      return newExpense;
    }
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
    
    console.log('Making API GET request for expenses:', `/expenses/user/${userId}`);
    
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
        throw new Error('No expenses data in API response');
      }
      
      const expenses = JSON.parse(JSON.stringify(response.body)) as Expense[];
      // Also save to localStorage for offline access
      saveToLocalStorage(`expenses_${userId}`, expenses);
      return expenses;
    } catch (apiError) {
      console.error('API call error for expenses list:', apiError);
      console.log('Checking localStorage for expenses data');
      
      // Try localStorage
      const expensesData = getFromLocalStorage(`expenses_${userId}`) as Expense[] | null;
      if (expensesData) {
        console.log('Found expenses data in localStorage:', expensesData);
        return expensesData;
      }
      
      console.log('No expenses data found in localStorage either. Returning empty array.');
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
    
    try {
      // Try the API first
      const operation = get({
        apiName: API_NAME,
        path: `/reports/${userId}`,
        options: {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      });
      
      console.log('Report operation created, awaiting response...');
      const response = await operation.response;
      console.log('Report response received:', response);
      
      const data = JSON.parse(JSON.stringify(response.body)) as { url: string };
      return data.url;
    } catch (apiError) {
      console.error('API call error for report:', apiError);
      console.log('Falling back to local CSV generation');
      
      // Fallback to local CSV generation
      // Generate CSV content from local storage expenses
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
      
      // Create a blob with specific type for Excel
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Return the local URL
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
    
    try {
      const operation = del({
        apiName: API_NAME,
        path: `/expenses/${expenseId}`,
        options: {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      });
      
      console.log('Delete expense operation created, awaiting response...');
      const response = await operation.response;
      console.log('Delete expense response received:', response);
      
      // Also remove from localStorage
      const expensesKey = `expenses_${userId}`;
      const existingExpenses = getFromLocalStorage(expensesKey) as Expense[] || [];
      const updatedExpenses = existingExpenses.filter(exp => exp.expenseId !== expenseId);
      saveToLocalStorage(expensesKey, updatedExpenses);
      
      console.log('Expense deleted successfully');
    } catch (apiError) {
      console.error('API call error for expense deletion:', apiError);
      console.log('Falling back to localStorage for expense deletion');
      
      // Fallback to localStorage
      const expensesKey = `expenses_${userId}`;
      const existingExpenses = getFromLocalStorage(expensesKey) as Expense[] || [];
      const updatedExpenses = existingExpenses.filter(exp => exp.expenseId !== expenseId);
      saveToLocalStorage(expensesKey, updatedExpenses);
      
      console.log('Deleted expense from localStorage');
    }
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
}; 