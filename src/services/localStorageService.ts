
// Local storage service to replace AWS DynamoDB

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
export const createUser = (userId: string, email: string): void => {
  const user: User = {
    userId,
    email,
    monthlyBudget: 0,
    createdAt: new Date().toISOString()
  };
  localStorage.setItem(`user_${userId}`, JSON.stringify(user));
};

export const updateUserBudget = (userId: string, monthlyBudget: number): void => {
  const userString = localStorage.getItem(`user_${userId}`);
  if (userString) {
    const user: User = JSON.parse(userString);
    user.monthlyBudget = monthlyBudget;
    localStorage.setItem(`user_${userId}`, JSON.stringify(user));
  }
};

export const getUserDetails = (userId: string): User | null => {
  const userString = localStorage.getItem(`user_${userId}`);
  return userString ? JSON.parse(userString) : null;
};

// Expense operations
export const addExpense = (expense: Expense): void => {
  const expensesString = localStorage.getItem(`expenses_${expense.userId}`) || '[]';
  const expenses: Expense[] = JSON.parse(expensesString);
  expenses.push(expense);
  localStorage.setItem(`expenses_${expense.userId}`, JSON.stringify(expenses));
};

export const getExpenses = (userId: string): Expense[] => {
  const expensesString = localStorage.getItem(`expenses_${userId}`) || '[]';
  return JSON.parse(expensesString);
};

export const generateCSVReport = (userId: string, fileName: string, expenses: Expense[]): string => {
  // Generate CSV content
  const headers = 'Date,Amount,Category,Description\n';
  const rows = expenses.map(expense => 
    `${expense.date},${expense.amount},${expense.category},${expense.description}`
  ).join('\n');
  
  const csvContent = headers + rows;
  
  // Create a blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv' });
  return URL.createObjectURL(blob);
};
