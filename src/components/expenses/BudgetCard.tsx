import React, { useState } from 'react';
import { useExpense } from '../../contexts/ExpenseContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { IndianRupeeIcon, TrendingUp, AlertTriangle } from 'lucide-react';

const BudgetCard: React.FC = () => {
  const { userDetails, setMonthlyBudget, totalSpent, remainingBudget } = useExpense();
  const [budget, setBudget] = useState(userDetails?.monthlyBudget?.toString() || '');
  const [isEditing, setIsEditing] = useState(!userDetails?.monthlyBudget);

  const handleSaveBudget = async () => {
    if (!budget || isNaN(Number(budget)) || Number(budget) <= 0) return;
    
    await setMonthlyBudget(Number(budget));
    setIsEditing(false);
  };

  const percentSpent = userDetails?.monthlyBudget 
    ? Math.min(100, (totalSpent / userDetails.monthlyBudget) * 100) 
    : 0;
    
  // Determine status color based on percentage
  const getStatusColor = () => {
    if (percentSpent < 50) return 'bg-blue-600';
    if (percentSpent < 80) return 'bg-purple-600';
    return 'bg-red-700';
  };

  return (
    <Card className="w-full bg-gray-900 border-0 shadow-md rounded-xl overflow-hidden">
      <div className="h-2">
        <div className={`${getStatusColor()} h-full`} style={{ width: `${percentSpent}%` }}></div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center text-white">
          <div className="bg-gradient-to-r from-red-600 to-purple-600 p-1.5 rounded-md mr-2">
            <IndianRupeeIcon className="h-4 w-4 text-white" />
          </div>
          Monthly Budget
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="flex flex-col space-y-3">
            <Input
              type="number"
              placeholder="Enter monthly budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="text-lg bg-gray-800 border-gray-700 text-white focus:ring-red-600"
            />
            <Button onClick={handleSaveBudget} className="w-full bg-gradient-to-r from-red-700 to-red-900 hover:opacity-90 text-white shadow-sm">
              Save Budget
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-400">Monthly Allowance</p>
                <p className="text-3xl font-bold text-white">₹{userDetails?.monthlyBudget || 0}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
              >
                Edit
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Spent</p>
                <p className="text-xl font-semibold text-blue-300">₹{totalSpent}</p>
              </div>
              <div className={`rounded-lg p-3 ${remainingBudget >= 0 ? 'bg-gray-800' : 'bg-red-900/30'}`}>
                <p className="text-xs text-gray-400 mb-1">Remaining</p>
                <p className={`text-xl font-semibold ${remainingBudget >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{Math.abs(remainingBudget)}
                </p>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="flex justify-between mb-1">
                <p className="text-xs text-gray-400">{percentSpent.toFixed(0)}% used</p>
                <p className="text-xs text-gray-400">{(100 - percentSpent).toFixed(0)}% available</p>
              </div>
              <div className="bg-gray-800 rounded-full h-2 w-full overflow-hidden">
                <div 
                  className={`${getStatusColor()} h-full transition-all duration-700 ease-in-out`} 
                  style={{ width: `${percentSpent}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        {!isEditing && (
          <div className={`text-sm w-full flex items-center gap-2 ${remainingBudget < 0 ? 'text-red-400' : 'text-gray-300'}`}>
            {remainingBudget < 0 ? (
              <>
                <AlertTriangle className="h-4 w-4" />
                <p>You've exceeded your budget by ₹{Math.abs(remainingBudget)}</p>
              </>
            ) : percentSpent > 80 ? (
              <>
                <AlertTriangle className="h-4 w-4 text-purple-400" />
                <p>You're approaching your budget limit</p>
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <p>You have ₹{remainingBudget} left to spend this month</p>
              </>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default BudgetCard;
