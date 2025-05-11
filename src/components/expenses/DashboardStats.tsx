
import React from 'react';
import { useExpense } from '../../contexts/ExpenseContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, IndianRupeeIcon } from 'lucide-react';

const DashboardStats: React.FC = () => {
  const { expenses, categories } = useExpense();
  
  // Calculate top category
  const categoryTotals = expenses.reduce((totals: Record<string, number>, expense) => {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    return totals;
  }, {});
  
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  
  // Calculate highest expense
  const highestExpense = expenses.length > 0 
    ? expenses.reduce((max, expense) => expense.amount > max.amount ? expense : max, expenses[0])
    : null;
    
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral">
            Top Spending Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topCategory ? (
            <>
              <div className="text-2xl font-bold">{topCategory[0]}</div>
              <p className="text-xs text-neutral mt-1 flex items-center">
                <ArrowUp className="h-3 w-3 mr-1 text-destructive" />
                ₹{topCategory[1].toFixed(2)} total spent
              </p>
            </>
          ) : (
            <div className="text-neutral">No data yet</div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-neutral">
            Highest Single Expense
          </CardTitle>
        </CardHeader>
        <CardContent>
          {highestExpense ? (
            <>
              <div className="text-2xl font-bold">₹{highestExpense.amount.toFixed(2)}</div>
              <p className="text-xs text-neutral mt-1 flex items-center">
                <ArrowDown className="h-3 w-3 mr-1 text-primary" />
                {highestExpense.category} - {highestExpense.description || "No description"}
              </p>
            </>
          ) : (
            <div className="text-neutral">No data yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
