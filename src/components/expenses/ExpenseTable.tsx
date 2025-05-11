import React, { useState } from 'react';
import { useExpense } from '../../contexts/ExpenseContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { DownloadIcon, FileSpreadsheet, IndianRupeeIcon, Tag, Calendar, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const ExpenseTable: React.FC = () => {
  const { expenses, categories, generateReport } = useExpense();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  
  // Filter expenses based on search term and category
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' ? true : expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Sort expenses by date (newest first)
  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDownloadReport = async () => {
    try {
      setLoading(true);
      const url = await generateReport();
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Failed to download report:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get category color based on category name with dark mode support
  const getCategoryColor = (category: string) => {
    const lightColors: Record<string, string> = {
      'Food': 'bg-orange-100 text-orange-800 border-orange-200',
      'Travel': 'bg-blue-100 text-blue-800 border-blue-200',
      'Rent': 'bg-red-100 text-red-800 border-red-200',
      'Stationery': 'bg-amber-100 text-amber-800 border-amber-200',
      'Utilities': 'bg-teal-100 text-teal-800 border-teal-200',
      'Entertainment': 'bg-purple-100 text-purple-800 border-purple-200',
      'Clothing': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Health': 'bg-green-100 text-green-800 border-green-200',
      'Education': 'bg-sky-100 text-sky-800 border-sky-200',
      'Other': 'bg-gray-100 text-gray-800 border-gray-200',
    };

    const darkColors: Record<string, string> = {
      'Food': 'dark:bg-orange-950 dark:text-orange-200 dark:border-orange-900',
      'Travel': 'dark:bg-blue-950 dark:text-blue-200 dark:border-blue-900',
      'Rent': 'dark:bg-red-950 dark:text-red-200 dark:border-red-900',
      'Stationery': 'dark:bg-amber-950 dark:text-amber-200 dark:border-amber-900',
      'Utilities': 'dark:bg-teal-950 dark:text-teal-200 dark:border-teal-900',
      'Entertainment': 'dark:bg-purple-950 dark:text-purple-200 dark:border-purple-900',
      'Clothing': 'dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-900',
      'Health': 'dark:bg-green-950 dark:text-green-200 dark:border-green-900',
      'Education': 'dark:bg-sky-950 dark:text-sky-200 dark:border-sky-900',
      'Other': 'dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700',
    };
    
    const lightColor = lightColors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
    const darkColor = darkColors[category] || 'dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700';
    
    return `${lightColor} ${darkColor}`;
  };

  return (
    <div className="w-full">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              placeholder="Search expense descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus:ring-primary focus:border-primary dark:bg-card"
            />
          </div>
          <div className="flex flex-row gap-3">
            <div className="relative w-full sm:w-[180px]">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="focus:ring-primary focus:border-primary dark:bg-card">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="All Categories" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleDownloadReport}
              disabled={loading || expenses.length === 0}
              className="bg-background hover:bg-muted text-foreground border-border"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Exporting...</span>
                </span>
              ) : (
                <span className="flex items-center">
                  <FileSpreadsheet className="h-4 w-4 mr-2 text-primary" />
                  <span>Export</span>
                </span>
              )}
            </Button>
          </div>
        </div>
        
        {expenses.length === 0 ? (
          <div className="text-center py-12 bg-card dark:bg-card rounded-xl border border-border shadow-sm">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <IndianRupeeIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No expenses yet</h3>
              <p className="text-muted-foreground max-w-sm">
                Start tracking your spending by adding your first expense using the form above.
              </p>
            </div>
          </div>
        ) : sortedExpenses.length === 0 ? (
          <div className="text-center py-12 bg-card dark:bg-card rounded-xl border border-border shadow-sm">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No matching expenses</h3>
              <p className="text-muted-foreground max-w-sm">
                No expenses match your current search criteria. Try adjusting your filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden bg-card dark:bg-card border border-border shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50 dark:bg-muted/20 dark:hover:bg-muted/20">
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedExpenses.map((expense) => (
                    <TableRow key={expense.expenseId} className="hover:bg-muted/50 dark:hover:bg-muted/10 border-border">
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-2 text-muted-foreground" />
                          {format(parseISO(expense.date), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`font-normal ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {expense.description || <span className="text-muted-foreground text-sm italic">No description</span>}
                      </TableCell>
                      <TableCell className="text-right font-medium whitespace-nowrap">
                        <div className="flex items-center justify-end">
                          <IndianRupeeIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>{expense.amount.toFixed(2)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTable;
