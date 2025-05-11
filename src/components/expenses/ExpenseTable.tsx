
import React, { useState } from 'react';
import { useExpense } from '../../contexts/ExpenseContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { DownloadIcon, ListIcon, IndianRupeeIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ExpenseTable: React.FC = () => {
  const { expenses, categories, generateReport } = useExpense();
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

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center">
          <ListIcon className="h-5 w-5 mr-1 text-primary" />
          Expense History
        </CardTitle>
        <Button 
          variant="outline"
          size="sm"
          onClick={handleDownloadReport}
          disabled={loading || expenses.length === 0}
          className="flex items-center text-xs"
        >
          <DownloadIcon className="h-4 w-4 mr-1" />
          {loading ? 'Generating...' : 'Download CSV'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Categories" />
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
          
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-neutral">
              No expenses recorded yet. Add your first expense above!
            </div>
          ) : sortedExpenses.length === 0 ? (
            <div className="text-center py-8 text-neutral">
              No expenses match your search criteria.
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedExpenses.map((expense) => (
                      <TableRow key={expense.expenseId}>
                        <TableCell className="whitespace-nowrap">
                          {format(parseISO(expense.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {expense.description || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{expense.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseTable;
