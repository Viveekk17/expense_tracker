import React, { useState } from 'react';
import { useExpense } from '../../contexts/ExpenseContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Plus, IndianRupeeIcon, Receipt, CheckCircle } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const ExpenseForm: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    amount?: string;
    category?: string;
    date?: string;
  }>({});
  
  const { categories, addExpense } = useExpense();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!amount || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!date) {
      newErrors.date = 'Please select a date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      await addExpense({
        amount: Number(amount),
        category,
        date: format(date!, 'yyyy-MM-dd'),
        description
      });
      
      // Show success state briefly
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      
      // Reset form
      setAmount('');
      setCategory('');
      setDate(new Date());
      setDescription('');
      setErrors({});
    } catch (error) {
      console.error('Failed to add expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-white dark:bg-gray-800/50 border-0 shadow-md rounded-xl">
      <div className="h-1 bg-gradient-to-r from-red-700 via-purple-700 to-black"></div>
      <CardHeader>
        <CardTitle className="text-lg flex items-center dark:text-gray-200">
          <div className="bg-gradient-to-r from-red-700 to-black p-1.5 rounded-md mr-2">
            <Receipt className="h-4 w-4 text-white" />
          </div>
          New Expense
        </CardTitle>
        <CardDescription className="dark:text-gray-400">Record your expenses to track your spending</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          <div className="relative">
            <label htmlFor="amount" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Amount
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IndianRupeeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) {
                    setErrors(prev => ({ ...prev, amount: undefined }));
                  }
                }}
                className={cn(
                  "pl-10 focus:ring-red-600 focus:border-red-600 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700",
                  errors.amount && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
                required
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Category
            </label>
            <Select 
              value={category} 
              onValueChange={(value) => {
                setCategory(value);
                if (errors.category) {
                  setErrors(prev => ({ ...prev, category: undefined }));
                }
              }}
              required
            >
              <SelectTrigger 
                id="category" 
                className={cn(
                  "focus:ring-red-600 focus:border-red-600 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700",
                  errors.category && "border-red-500 focus:border-red-500 focus:ring-red-500"
                )}
              >
                <SelectValue placeholder="Select expense category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="date" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Date of Expense
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700",
                    !date && "text-muted-foreground",
                    errors.date && "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "MMMM d, yyyy") : <span>Select a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    if (errors.date) {
                      setErrors(prev => ({ ...prev, date: undefined }));
                    }
                  }}
                  initialFocus
                  className="rounded-md border dark:bg-gray-900 dark:text-gray-200"
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="mt-1 text-sm text-red-500">{errors.date}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Description (Optional)
            </label>
            <Textarea
              id="description"
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none focus:ring-red-600 focus:border-red-600 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className={cn(
              "w-full transition-all relative",
              success 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-gradient-to-r from-red-700 to-red-900 hover:opacity-90"
            )}
            disabled={loading || success}
          >
            {success ? (
              <span className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" /> Expense Added
              </span>
            ) : loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center">
                <Plus className="mr-2 h-4 w-4" /> Add Expense
              </span>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ExpenseForm;
