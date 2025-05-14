import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tag, TrendingUp, LineChart, BarChart3, PieChart } from 'lucide-react'
import { useExpense } from '../../contexts/ExpenseContext'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart as RechartsPieChart, Pie, Legend 
} from '../ui/chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

type CategorySummary = {
  category: string;
  amount: number;
  percentage: number;
}

type MonthlyTrend = {
  month: string;
  amount: number;
}

const COLORS = [
  '#3b82f6',  // blue
  '#ef4444',  // red
  '#10b981',  // green
  '#f59e0b',  // amber
  '#8b5cf6',  // purple
  '#ec4899',  // pink
  '#14b8a6',  // teal
  '#f97316',  // orange
  '#6366f1',  // indigo
  '#64748b',  // slate
];

export function DashboardStats() {
  const { expenses, totalSpent, remainingBudget, userDetails } = useExpense()
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([])
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([])
  const [insightsMessage, setInsightsMessage] = useState<string>('')
  const [activeView, setActiveView] = useState<'pie' | 'bar'>('pie')

  useEffect(() => {
    if (expenses.length > 0) {
      generateCategorySummary()
      generateMonthlyTrend()
      generateInsights()
    }
  }, [expenses])

  const generateCategorySummary = () => {
    const categoryMap = new Map<string, number>()
    
    // Sum up expenses by category
    expenses.forEach(expense => {
      const currentTotal = categoryMap.get(expense.category) || 0
      categoryMap.set(expense.category, currentTotal + expense.amount)
    })
    
    // Convert to array and calculate percentages
    const summary: CategorySummary[] = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount)
    
    setCategorySummary(summary)
  }

  const generateMonthlyTrend = () => {
    const monthlyData = new Map<string, number>()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    // Initialize all months with 0
    months.forEach(month => monthlyData.set(month, 0))
    
    // Sum up expenses by month
    expenses.forEach(expense => {
      const date = new Date(expense.date)
      const month = months[date.getMonth()]
      const currentTotal = monthlyData.get(month) || 0
      monthlyData.set(month, currentTotal + expense.amount)
    })
    
    // Convert to array and sort by month
    const trend: MonthlyTrend[] = months.map(month => ({
      month,
      amount: monthlyData.get(month) || 0
    }))
    
    setMonthlyTrend(trend)
  }

  const generateInsights = () => {
    // Generate spending insights based on the expense data
    let message = ''
    
    // Get top categories
    if (categorySummary.length > 0) {
      const topCategory = categorySummary[0]
      message += `Your highest spending is on ${topCategory.category} (${topCategory.percentage}% of total). `
      
      // Add budget warning if needed
      if (userDetails && userDetails.monthlyBudget > 0) {
        const budgetUsedPercentage = Math.round((totalSpent / userDetails.monthlyBudget) * 100)
        
        if (budgetUsedPercentage > 90) {
          message += `Warning: You've used ${budgetUsedPercentage}% of your monthly budget. `
        } else if (budgetUsedPercentage > 70) {
          message += `Note: You've used ${budgetUsedPercentage}% of your monthly budget. `
        }
      }
      
      // Look for spending trends
      if (monthlyTrend.length >= 2) {
        const currentMonth = monthlyTrend[monthlyTrend.length - 1].amount
        const previousMonth = monthlyTrend[monthlyTrend.length - 2].amount
        
        if (previousMonth > 0) {
          const percentChange = Math.round(((currentMonth - previousMonth) / previousMonth) * 100)
          
          if (percentChange > 20) {
            message += `Your spending increased by ${percentChange}% compared to last month. `
          } else if (percentChange < -20) {
            message += `Great job! Your spending decreased by ${Math.abs(percentChange)}% compared to last month. `
          }
        }
      }
    }
    
    if (!message) {
      message = 'Add more expenses to generate personalized spending insights.'
    }
    
    setInsightsMessage(message)
  }

  return (
    <>
      <div className="grid gap-4">
        {/* First row with 3 cards */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card className="bg-[#121828] border-0 shadow-sm rounded-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Spent
              </CardTitle>
              <div className="rounded-full bg-blue-900/30 p-1">
                <Tag className="h-4 w-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">₹{totalSpent.toLocaleString()}</div>
              <p className="text-xs text-gray-400">
                From all recorded expenses
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#121828] border-0 shadow-sm rounded-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-teal-400 to-green-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Remaining Budget
              </CardTitle>
              <div className="rounded-full bg-green-900/30 p-1">
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">₹{remainingBudget.toLocaleString()}</div>
              <p className="text-xs text-gray-400">
                {remainingBudget < 0 ? 'Over budget' : 'Available to spend'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#121828] border-0 shadow-sm rounded-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-purple-400 to-indigo-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Top Category
              </CardTitle>
              <div className="rounded-full bg-purple-900/30 p-1">
                <PieChart className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white truncate">
                {categorySummary.length > 0 ? categorySummary[0].category : 'None'}
              </div>
              <p className="text-xs text-gray-400">
                {categorySummary.length > 0 
                  ? `${categorySummary[0].percentage}% of total spending` 
                  : 'Add expenses to see top category'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Second row with Spending Insights at full width */}
        <Card className="bg-[#121828] border-0 shadow-sm rounded-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">
              Spending Insights
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 text-amber-400 hover:text-amber-300 hover:bg-amber-900/20">
                  <BarChart3 className="h-4 w-4" />
                  <span className="sr-only">View spending analysis</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[625px] bg-[#1a2234] border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Spending Analysis</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="category">
                  <TabsList className="grid w-full grid-cols-2 bg-[#121828]">
                    <TabsTrigger value="category">Category Breakdown</TabsTrigger>
                    <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
                  </TabsList>
                  <TabsContent value="category" className="mt-4">
                    <div className="h-[300px] w-full bg-[#192031] rounded-lg p-4 shadow-sm">
                      {categorySummary.length > 0 ? (
                        <div className="h-full">
                          <div className="flex justify-end mb-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActiveView(activeView === 'pie' ? 'bar' : 'pie')}
                              className="text-primary hover:text-primary/80"
                            >
                              {activeView === 'pie' ? 'Show Bar Chart' : 'Show Pie Chart'}
                            </Button>
                          </div>
                          <ResponsiveContainer width="100%" height="100%">
                            {activeView === 'pie' ? (
                              <RechartsPieChart>
                                <Pie
                                  data={categorySummary}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="amount"
                                  animationBegin={0}
                                  animationDuration={1200}
                                  animationEasing="ease-in-out"
                                >
                                  {categorySummary.map((entry, index) => (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={COLORS[index % COLORS.length]}
                                      stroke="#1a2234"
                                      strokeWidth={2}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(value: number) => [`₹${value}`, 'Amount']}
                                  contentStyle={{ 
                                    backgroundColor: '#192031', 
                                    borderColor: '#334155',
                                    borderRadius: '8px',
                                    padding: '8px'
                                  }}
                                  itemStyle={{ color: '#e2e8f0' }}
                                  labelStyle={{ color: '#e2e8f0' }}
                                />
                                <Legend
                                  layout="vertical"
                                  align="right"
                                  verticalAlign="middle"
                                  formatter={(value, entry: any) => (
                                    <span className="text-gray-300 text-sm">
                                      {value} ({entry.payload.percentage}%)
                                    </span>
                                  )}
                                />
                              </RechartsPieChart>
                            ) : (
                              <BarChart
                                layout="vertical"
                                data={categorySummary.slice(0, 10)}
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                                <XAxis type="number" tickFormatter={(value) => `₹${value}`} stroke="#94a3b8" />
                                <YAxis 
                                  type="category" 
                                  dataKey="category" 
                                  tick={{ fontSize: 12 }} 
                                  width={90}
                                  stroke="#94a3b8"
                                />
                                <Tooltip 
                                  formatter={(value) => [`₹${value}`, 'Amount']}
                                  labelFormatter={(value) => `Category: ${value}`}
                                  contentStyle={{ 
                                    backgroundColor: '#192031', 
                                    borderColor: '#334155',
                                    borderRadius: '8px',
                                    padding: '8px'
                                  }}
                                  itemStyle={{ color: '#e2e8f0' }}
                                  labelStyle={{ color: '#e2e8f0' }}
                                />
                                <Bar 
                                  dataKey="amount"
                                  animationBegin={0}
                                  animationDuration={1200}
                                  animationEasing="ease-in-out"
                                  radius={[0, 4, 4, 0]}
                                >
                                  {categorySummary.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-center text-gray-400">
                            Add expenses to see category breakdown
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="trends" className="mt-4">
                    <div className="h-[300px] w-full bg-[#192031] rounded-lg p-4 shadow-sm">
                      {monthlyTrend.length > 0 && monthlyTrend.some(item => item.amount > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={monthlyTrend}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="month" stroke="#94a3b8" />
                            <YAxis tickFormatter={(value) => `₹${value}`} stroke="#94a3b8" />
                            <Tooltip 
                              formatter={(value) => [`₹${value}`, 'Amount']}
                              labelFormatter={(value) => `Month: ${value}`}
                              contentStyle={{ 
                                backgroundColor: '#192031', 
                                borderColor: '#334155',
                                borderRadius: '8px',
                                padding: '8px'
                              }}
                              itemStyle={{ color: '#e2e8f0' }}
                              labelStyle={{ color: '#e2e8f0' }}
                            />
                            <Bar 
                              dataKey="amount" 
                              fill="#3b82f6" 
                              name="Spending"
                              animationBegin={0}
                              animationDuration={1200}
                              animationEasing="ease-in-out"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-center text-gray-400">
                            Add expenses to see monthly trends
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
                <div className="mt-4 rounded-md border border-gray-700 p-4 text-sm bg-[#192031] shadow-sm">
                  <h4 className="font-medium mb-1 text-indigo-400">Smart Insights</h4>
                  <p className="text-gray-300">{insightsMessage}</p>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center">
              <LineChart className="h-4 w-4 text-amber-400 mr-1.5" />
              <span className="text-xs font-semibold text-amber-400">INSIGHT</span>
            </div>
            <p className="text-sm text-gray-300 line-clamp-3">
              {insightsMessage || 'Add more expenses to generate personalized spending insights.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
