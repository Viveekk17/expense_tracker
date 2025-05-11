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
    <div className="relative min-h-screen bg-background transition-colors duration-300 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl"></div>
        <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl"></div>
      </div>
      
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <div className="p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg">
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col min-h-screen">
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="w-full max-w-md space-y-8 animate-fadeIn">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight mb-2 gradient-text">
                Campus Expense Compass
              </h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto">
                Track, manage and analyze your student expenses with ease
              </p>
            </div>
            
            <div className="animate-scaleIn">
              <AuthForm />
            </div>
          </div>
        </main>
        
        <footer className="mt-auto py-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Campus Expense Compass. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Auth; 