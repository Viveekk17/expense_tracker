import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WalletIcon, LogOut, UserIcon } from 'lucide-react';
import { signOut } from '../../services/awsAuthService';
import { useExpense } from '../../contexts/ExpenseContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useToast } from '@/hooks/use-toast';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userDetails } = useExpense();
  const { theme } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
        variant: 'default',
      });
      window.location.href = '/login';
    } catch (error: any) {
      toast({
        title: 'Error signing out',
        description: error.message || 'There was an error signing out.',
        variant: 'destructive',
      });
    }
  };

  return (
    <nav className="bg-gray-900 dark:bg-gray-950 shadow-lg border-b border-gray-800 dark:border-gray-900">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          {/* Left: Icon, Heading, Subheading */}
          <div className="flex flex-row items-center gap-2 justify-start w-full sm:w-auto">
            <div className="bg-gradient-to-r from-primary to-purple-500 p-2 rounded-lg shadow-md">
              <WalletIcon className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Campus Expense Compass
              </span>
              <div className="text-xs text-gray-400 leading-tight">Track your spending wisely</div>
            </div>
          </div>

          {/* Center: Username (mobile only) */}
          {userDetails && (
            <div className="flex justify-center w-full sm:hidden mt-2">
              <div className="flex items-center space-x-2 bg-gray-800 dark:bg-gray-900 px-3 py-1.5 rounded-full">
                <UserIcon className="h-4 w-4 text-primary" />
                <span className="text-sm text-gray-300">{userDetails.email}</span>
              </div>
            </div>
          )}

          {/* Right: Theme toggle, Username (desktop), Signout */}
          <div className="flex items-center gap-2 justify-end w-full sm:w-auto mt-2 sm:mt-0">
            <ThemeToggle />
            {userDetails && (
              <div className="hidden sm:flex items-center space-x-2 bg-gray-800 dark:bg-gray-900 px-3 py-1.5 rounded-full">
                <UserIcon className="h-4 w-4 text-primary" />
                <span className="text-sm text-gray-300">{userDetails.email}</span>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="flex items-center space-x-1 border-gray-700 bg-gray-800 dark:bg-gray-900 text-white hover:bg-gray-700 hover:text-red-300 transition-all"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
