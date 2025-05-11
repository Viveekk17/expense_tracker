import React from 'react';
import { useExpense } from '../../contexts/ExpenseContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag, TrendingUp, LineChart, BarChart3, PieChart } from 'lucide-react';

const DashboardStats: React.FC = () => {
  const { expenses, categories } = useExpense();
  
  // Calculate top category
  const categoryTotals = expenses.reduce((totals: Record<string, number>, expense) => {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    return totals;
  }, {});
  
  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3); // Get top 3 categories
  
  const topCategory = sortedCategories[0] || null;
  
  // Calculate highest expense
  const highestExpense = expenses.length > 0 
    ? expenses.reduce((max, expense) => expense.amount > max.amount ? expense : max, expenses[0])
    : null;
  
  // Calculate total last 7 days vs previous 7 days
  const now = new Date();
  const last7Days = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const daysDiff = Math.floor((now.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff < 7;
  });
  
  const previous7Days = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const daysDiff = Math.floor((now.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 7 && daysDiff < 14;
  });
  
  const last7DaysTotal = last7Days.reduce((sum, expense) => sum + expense.amount, 0);
  const previous7DaysTotal = previous7Days.reduce((sum, expense) => sum + expense.amount, 0);
  
  let percentChange = 0;
  let isIncrease = false;
  
  if (previous7DaysTotal > 0) {
    percentChange = ((last7DaysTotal - previous7DaysTotal) / previous7DaysTotal) * 100;
    isIncrease = percentChange > 0;
  }
    
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-white border-0 shadow-sm rounded-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
            <PieChart className="h-4 w-4 mr-2 text-indigo-400" />
            Top Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedCategories.length > 0 ? (
            <div className="space-y-3">
              {sortedCategories.map(([category, amount], index) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-indigo-500' : 'bg-purple-500'}`}></div>
                    <span className="text-sm font-medium">{category}</span>
                  </div>
                  <span className="text-sm text-gray-700">₹{amount.toFixed(0)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-2 text-gray-500 text-sm">No data available yet</div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-white border-0 shadow-sm rounded-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-400 to-green-500"></div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-emerald-400" />
            7 Day Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <div>
              <div className="flex items-baseline">
                <div className="text-2xl font-bold text-gray-800">₹{last7DaysTotal.toFixed(0)}</div>
                {previous7DaysTotal > 0 && (
                  <div className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-medium ${isIncrease ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {isIncrease ? '+' : ''}{percentChange.toFixed(0)}%
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                vs ₹{previous7DaysTotal.toFixed(0)} previous week
              </p>
            </div>
          ) : (
            <div className="py-2 text-gray-500 text-sm">No data available yet</div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-white border-0 shadow-sm rounded-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
            <BarChart3 className="h-4 w-4 mr-2 text-amber-400" />
            Largest Expense
          </CardTitle>
        </CardHeader>
        <CardContent>
          {highestExpense ? (
            <div>
              <div className="text-2xl font-bold text-gray-800">₹{highestExpense.amount.toFixed(0)}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded-full text-xs">
                  {highestExpense.category}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {highestExpense.description ? `- ${highestExpense.description}` : ""}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-2 text-gray-500 text-sm">No data available yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
