import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { useExpense } from '../../contexts/ExpenseContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { AlertTriangle, Info, LineChart, PieChart, TrendingUp, Tag } from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart as RechartsPieChart, Pie, Legend, LineChart as RechartsLineChart, Line 
} from '../ui/chart'
import { Button } from '../ui/button'

type CategorySummary = {
  category: string
  amount: number
  percentage: number
}

type DailySummary = {
  date: string
  amount: number
}

type TrendInsight = {
  type: 'info' | 'warning' | 'success'
  title: string
  description: string
}

const COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#6366f1', // indigo
  '#64748b', // slate
]

export function ExpenseAnalytics() {
  const { expenses, totalSpent, remainingBudget, userDetails } = useExpense()
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([])
  const [dailySpending, setDailySpending] = useState<DailySummary[]>([])
  const [insights, setInsights] = useState<TrendInsight[]>([])

  useEffect(() => {
    if (expenses.length > 0) {
      generateCategorySummary()
      generateDailySpending()
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
        percentage: Math.round((amount / totalSpent) * 100)
      }))
      .sort((a, b) => b.amount - a.amount)
    
    setCategorySummary(summary)
  }

  const generateDailySpending = () => {
    // Create a map for the last 30 days
    const dailyMap = new Map<string, number>()
    const dailyData: DailySummary[] = []
    
    // Get dates for the last 30 days
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dailyMap.set(dateStr, 0)
      dailyData.push({
        date: dateStr,
        amount: 0
      })
    }
    
    // Sum up expenses by day
    expenses.forEach(expense => {
      const dateStr = expense.date.split('T')[0]
      if (dailyMap.has(dateStr)) {
        const currentAmount = dailyMap.get(dateStr) || 0
        dailyMap.set(dateStr, currentAmount + expense.amount)
      }
    })
    
    // Update the daily data with actual amounts
    dailyData.forEach((day, index) => {
      dailyData[index].amount = dailyMap.get(day.date) || 0
    })
    
    setDailySpending(dailyData)
  }

  const generateInsights = () => {
    const newInsights: TrendInsight[] = []
    
    // Check budget status
    if (userDetails && userDetails.monthlyBudget > 0) {
      const budgetUsedPercentage = Math.round((totalSpent / userDetails.monthlyBudget) * 100)
      
      if (budgetUsedPercentage > 90) {
        newInsights.push({
          type: 'warning',
          title: 'Budget Alert',
          description: `You've used ${budgetUsedPercentage}% of your monthly budget. Consider reducing expenses for the rest of the month.`
        })
      } else if (budgetUsedPercentage > 70) {
        newInsights.push({
          type: 'info',
          title: 'Budget Status',
          description: `You've used ${budgetUsedPercentage}% of your monthly budget. You're on track but be mindful of your spending.`
        })
      } else if (budgetUsedPercentage <= 70) {
        newInsights.push({
          type: 'success',
          title: 'Budget On Track',
          description: `You've only used ${budgetUsedPercentage}% of your monthly budget. You're doing great!`
        })
      }
    }
    
    // Check category insights
    if (categorySummary.length >= 2) {
      const topCategory = categorySummary[0]
      if (topCategory.percentage > 50) {
        newInsights.push({
          type: 'warning',
          title: 'Spending Concentration',
          description: `${topCategory.percentage}% of your spending is on ${topCategory.category}. Consider diversifying your expenses.`
        })
      }
      
      // Food specific advice if it's in top categories
      const foodCategory = categorySummary.find(cat => cat.category.toLowerCase() === 'food')
      if (foodCategory && foodCategory.percentage > 30) {
        newInsights.push({
          type: 'info',
          title: 'Food Expenses',
          description: `You're spending ${foodCategory.percentage}% of your budget on food. Consider meal planning to reduce costs.`
        })
      }
    }
    
    // Check daily spending trends
    if (dailySpending.length > 0) {
      const last7Days = dailySpending.slice(-7)
      const last7DaysTotal = last7Days.reduce((sum, day) => sum + day.amount, 0)
      const averageDaily = last7DaysTotal / 7
      
      if (categorySummary.length > 0 && averageDaily > 0) {
        const projectedMonthly = averageDaily * 30
        if (userDetails?.monthlyBudget && projectedMonthly > userDetails.monthlyBudget) {
          newInsights.push({
            type: 'warning',
            title: 'Spending Trend',
            description: `Based on your recent spending, you're on track to exceed your monthly budget. Try to reduce daily expenses.`
          })
        }
      }
    }
    
    setInsights(newInsights)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-white">Expense Analytics</h2>
      <p className="text-gray-400">
        Visualize and analyze your spending patterns to make better financial decisions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-[#121828] border-0 shadow-sm rounded-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-500"></div>
          <div className="p-4">
            <div className="flex items-center mb-4">
              <div className="rounded-full bg-blue-900/30 p-1 mr-2">
                <LineChart className="h-4 w-4 text-blue-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-300">Top Categories</h3>
            </div>
            {categorySummary.length > 0 ? (
              <div className="space-y-3">
                {categorySummary.slice(0, 3).map((category, index) => (
                  <div key={category.category} className="flex items-center text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    <span>{category.category}</span>
                    <span className="ml-auto">₹{category.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Add expenses to see top categories</p>
            )}
          </div>
        </div>

        <div className="bg-[#121828] border-0 shadow-sm rounded-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
          <div className="p-4">
            <div className="flex items-center mb-4">
              <div className="rounded-full bg-green-900/30 p-1 mr-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-300">7 Day Trend</h3>
            </div>
            <div className="text-2xl font-bold text-white">
              ₹{dailySpending.slice(-7).reduce((sum, day) => sum + day.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              vs ₹0 previous week
            </p>
          </div>
        </div>

        <div className="bg-[#121828] border-0 shadow-sm rounded-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-400 to-yellow-500"></div>
          <div className="p-4">
            <div className="flex items-center mb-4">
              <div className="rounded-full bg-amber-900/30 p-1 mr-2">
                <Tag className="h-4 w-4 text-amber-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-300">Largest Expense</h3>
            </div>
            {dailySpending.length > 0 ? (
              <>
                <div className="text-2xl font-bold text-white">
                  ₹{Math.max(...dailySpending.map(day => day.amount)).toLocaleString()}
                </div>
                <div className="mt-1">
                  <span className="px-1.5 py-0.5 bg-amber-900/30 text-amber-400 rounded-full text-xs">
                    {categorySummary.length > 0 ? categorySummary[0].category : 'Food'}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-gray-500">Add expenses to see largest expense</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button variant="outline" className="rounded-full bg-indigo-600/20 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30 hover:text-indigo-300">
          <LineChart className="h-4 w-4 mr-2" />
          Statistics
        </Button>
      </div>

      <Tabs defaultValue="insights" className="space-y-4 mt-4">
        <TabsList className="grid w-full grid-cols-3 mb-2 bg-[#121828]">
          <TabsTrigger value="insights" className="text-sm data-[state=active]:text-white data-[state=active]:bg-[#1a2234]">Insights</TabsTrigger>
          <TabsTrigger value="categories" className="text-sm data-[state=active]:text-white data-[state=active]:bg-[#1a2234]">Categories</TabsTrigger>
          <TabsTrigger value="trends" className="text-sm data-[state=active]:text-white data-[state=active]:bg-[#1a2234]">Spending Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights" className="space-y-4">
          {insights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <Card key={index} className={`bg-[#121828] border-0 shadow-sm rounded-xl overflow-hidden ${insight.type === 'warning' ? 'border-l-4 border-l-orange-500' : insight.type === 'success' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-blue-500'}`}>
                  <div className="h-1 bg-gradient-to-r from-muted/50 to-muted"></div>
                  <CardHeader className="py-4">
                    <div className="flex items-center gap-2">
                      {insight.type === 'warning' ? (
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                      ) : insight.type === 'success' ? (
                        <LineChart className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Info className="h-5 w-5 text-blue-500" />
                      )}
                      <CardTitle className="text-base text-gray-300">{insight.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="py-0 pb-4">
                    <p className="text-gray-400">
                      {insight.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-[#121828] border-0 shadow-sm rounded-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
              <CardContent className="py-10 text-center">
                <p className="text-gray-400">
                  Add more expenses to generate personalized insights.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="categories">
          <Card className="bg-[#121828] border-0 shadow-sm rounded-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            <CardHeader>
              <CardTitle className="text-gray-300">Category Breakdown</CardTitle>
              <CardDescription className="text-gray-400">
                View how your spending is distributed across different categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] md:h-[400px]">
                {categorySummary.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6 h-full">
                    <div className="bg-[#1a2234] rounded-lg p-4 shadow-sm">
                      <h4 className="text-sm font-medium mb-3 text-gray-400">Distribution by Category</h4>
                      <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                          <Pie
                            data={categorySummary}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="amount"
                            nameKey="category"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            animationBegin={0}
                            animationDuration={1500}
                            animationEasing="ease-out"
                          >
                            {categorySummary.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => `₹${value}`}
                            contentStyle={{ backgroundColor: '#192031', borderColor: '#334155' }}
                            itemStyle={{ color: '#e2e8f0' }}
                          />
                          <Legend formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="bg-[#1a2234] rounded-lg p-4 shadow-sm">
                      <h4 className="text-sm font-medium mb-3 text-gray-400">Top Spending Categories</h4>
                      <ResponsiveContainer width="100%" height="90%">
                        <BarChart
                          layout="vertical"
                          data={categorySummary.slice(0, 5)}
                          margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                          <XAxis type="number" tickFormatter={(value) => `₹${value}`} stroke="#94a3b8" />
                          <YAxis type="category" dataKey="category" tick={{ fontSize: 12 }} width={90} stroke="#94a3b8" />
                          <Tooltip 
                            formatter={(value) => [`₹${value}`, 'Amount']}
                            contentStyle={{ backgroundColor: '#192031', borderColor: '#334155' }}
                            itemStyle={{ color: '#e2e8f0' }}
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
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-center text-gray-400">
                      Add expenses to see category breakdown
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-800 pt-4 flex justify-between">
              <div className="text-sm text-gray-400">
                {categorySummary.length > 0 && 
                  `Your highest spending is on ${categorySummary[0].category} (${categorySummary[0].percentage}% of total)`}
              </div>
              {categorySummary.length > 0 && 
                <div className="text-sm font-medium text-gray-300">
                  Total Categories: {categorySummary.length}
                </div>
              }
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card className="bg-[#121828] border-0 shadow-sm rounded-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-green-500"></div>
            <CardHeader>
              <CardTitle className="text-gray-300">Daily Spending Trends</CardTitle>
              <CardDescription className="text-gray-400">
                Track your spending patterns over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] md:h-[400px]">
                {dailySpending.length > 0 ? (
                  <div className="bg-[#1a2234] rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-medium mb-3 text-gray-400">Daily Spending Pattern</h4>
                    <ResponsiveContainer width="100%" height="90%">
                      <RechartsLineChart
                        data={dailySpending}
                        margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDate}
                          tick={{ fontSize: 12 }}
                          height={60}
                          interval={4}
                          stroke="#94a3b8"
                        />
                        <YAxis tickFormatter={(value) => `₹${value}`} stroke="#94a3b8" />
                        <Tooltip 
                          formatter={(value) => [`₹${value}`, 'Amount']}
                          labelFormatter={(value) => `Date: ${formatDate(value)}`}
                          contentStyle={{ backgroundColor: '#192031', borderColor: '#334155' }}
                          itemStyle={{ color: '#e2e8f0' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                          animationBegin={0}
                          animationDuration={1500}
                          animationEasing="ease-out"
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-center text-gray-400">
                      Add expenses to see daily spending trends
                    </p>
                  </div>
                )}
              </div>
              {dailySpending.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-[#1a2234] rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-medium mb-1 text-gray-400">Last 7 Days</h4>
                    <div className="text-2xl font-bold text-white">
                      ₹{dailySpending.slice(-7).reduce((sum, day) => sum + day.amount, 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Total spending in past week
                    </p>
                  </div>
                  <div className="bg-[#1a2234] rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-medium mb-1 text-gray-400">Daily Average</h4>
                    <div className="text-2xl font-bold text-white">
                      ₹{Math.round(dailySpending.slice(-30).reduce((sum, day) => sum + day.amount, 0) / 30).toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Average daily expense
                    </p>
                  </div>
                  <div className="bg-[#1a2234] rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-medium mb-1 text-gray-400">Highest Day</h4>
                    {(() => {
                      const highestDay = [...dailySpending].sort((a, b) => b.amount - a.amount)[0];
                      return (
                        <>
                          <div className="text-2xl font-bold text-white">
                            ₹{highestDay.amount.toLocaleString()}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            on {formatDate(highestDay.date)}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-gray-800 pt-4">
              <div className="text-sm text-gray-400">
                {dailySpending.length > 0 &&
                  `Month to date: ₹${dailySpending.reduce((sum, day) => sum + day.amount, 0).toLocaleString()}`}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 