import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WalletIcon, LogOut, UserIcon } from 'lucide-react';
import { signOut } from '../../services/awsAuthService';
import { useExpense } from '../../contexts/ExpenseContext';
import { useToast } from '@/hooks/use-toast';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userDetails } = useExpense();

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
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <WalletIcon className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-dark">Campus Expense Compass</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {userDetails && (
              <div className="flex items-center space-x-2">
                <UserIcon className="h-4 w-4" />
                <span className="text-sm hidden md:inline">{userDetails.email}</span>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="flex items-center space-x-1"
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
