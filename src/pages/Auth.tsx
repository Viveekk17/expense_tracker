import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpense } from '../contexts/ExpenseContext';
import AuthForm from '../components/auth/AuthForm';

const Auth: React.FC = () => {
  const { isAuthenticated, isLoading } = useExpense();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated && !isLoading) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8 text-center">Campus Expense Compass</h1>
        <p className="text-lg text-muted-foreground mb-8 text-center max-w-md">
          Track, manage and analyze your student expenses with ease.
        </p>
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Auth; 