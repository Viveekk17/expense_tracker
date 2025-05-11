
import React, { useState } from 'react';
import { useExpense } from '../../contexts/ExpenseContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { IndianRupeeIcon } from 'lucide-react';

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

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <IndianRupeeIcon className="h-5 w-5 mr-1 text-primary" />
          Monthly Budget
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="flex flex-col space-y-2">
            <Input
              type="number"
              placeholder="Enter monthly budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="text-lg"
            />
            <Button onClick={handleSaveBudget} className="w-full bg-primary hover:bg-primary/90">
              Save Budget
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-neutral">Budget</p>
                <p className="text-2xl font-semibold">₹{userDetails?.monthlyBudget || 0}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <p className="text-xs text-neutral">Spent: ₹{totalSpent}</p>
                <p className="text-xs text-neutral">Remaining: ₹{remainingBudget}</p>
              </div>
              <Progress value={percentSpent} className="h-2" />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        {!isEditing && (
          <p className={`text-xs w-full text-center ${remainingBudget < 0 ? 'text-destructive' : 'text-neutral'}`}>
            {remainingBudget >= 0 
              ? `You have ₹${remainingBudget} left to spend this month`
              : `You've exceeded your budget by ₹${Math.abs(remainingBudget)}`
            }
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default BudgetCard;
