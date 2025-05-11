import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpense } from '../contexts/ExpenseContext';
import { useTheme } from '../contexts/ThemeContext';
import AuthForm from '../components/auth/AuthForm';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const Auth: React.FC = () => {
  const { isAuthenticated, isLoading } = useExpense();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated && !isLoading) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  return (
    <div className="min-h-screen bg-background py-8 md:py-12 flex flex-col">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Campus Expense Compass
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
              Track, manage and analyze your student expenses with ease
            </p>
          </div>
          
          <AuthForm />
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Secure student expense tracking for budgeting success</p>
          </div>
        </div>
      </div>
      
      <footer className="mt-auto py-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Campus Expense Compass. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Auth; 