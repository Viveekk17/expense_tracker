import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { useExpense } from '../../contexts/ExpenseContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { AlertTriangle, Info, LineChart, PieChart, TrendingUp, Tag } from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart as RechartsPieChart, Pie, Legend, LineChart as RechartsLineChart, Line, Area 
} from '../ui/chart'
import { Button } from '../ui/button'
import { AnimatedPieChart } from '../ui/animations/AnimatedPieChart'
import { SimplePieChart } from '../ui/animations/SimplePieChart'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../ui/select'
import { CSSTransition, SwitchTransition } from 'react-transition-group'

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
  type: 'info' | 'warning' | 'success',
  title: string,
  description: string,
  sentiment?: 'positive' | 'negative' | 'neutral',
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
  const [pieKey, setPieKey] = useState(Date.now())
  const [activeTab, setActiveTab] = useState('insights')
  const [trendRange, setTrendRange] = useState<'week' | 'month'>('week')
  const [graphKey, setGraphKey] = useState('week')
  const [categoryChartType, setCategoryChartType] = useState<'pie' | 'bar'>('pie')
  const [insightFilter, setInsightFilter] = useState<'all' | 'positive' | 'negative'>('all')

  // Force pie chart to re-render on tab change
  const handleTabChange = (value: string) => {
    setPieKey(Date.now())
    setActiveTab(value)
  }

  useEffect(() => {
    generateCategorySummary()
    generateDailySpending()
    // Force rerender of pie chart when expenses change
    setPieKey(Date.now())
  }, [expenses, totalSpent, remainingBudget, userDetails])

  useEffect(() => {
    generateInsights()
  }, [expenses, categorySummary, dailySpending, totalSpent, remainingBudget, userDetails])

  // Add a separate effect for initial load
  useEffect(() => {
    // Set initial tab to insights
    setActiveTab('insights')
  }, [])

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
    
    // Add welcome insight if there are no expenses
    if (expenses.length === 0) {
      newInsights.push({
        type: 'info',
        title: 'Welcome to Expense Analytics',
        description: 'Start adding your expenses to get personalized insights and recommendations for better financial management.',
        sentiment: 'neutral',
      })
    } else {
      // Budget status and projections
      if (userDetails && userDetails.monthlyBudget > 0) {
        const budgetUsedPercentage = Math.round((totalSpent / userDetails.monthlyBudget) * 100)
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
        const currentDay = new Date().getDate()
        const expectedSpendByNow = (userDetails.monthlyBudget / daysInMonth) * currentDay
        const spendingRate = totalSpent / currentDay
        const projectedMonthly = spendingRate * daysInMonth

        if (budgetUsedPercentage > 90) {
          newInsights.push({
            type: 'warning',
            title: 'Budget Alert',
            description: `You've used ${budgetUsedPercentage}% of your monthly budget. At this rate, you'll exceed your budget by ₹${Math.abs(projectedMonthly - userDetails.monthlyBudget).toLocaleString()}.`,
            sentiment: 'negative',
          })
        } else if (budgetUsedPercentage > 70) {
          newInsights.push({
            type: 'info',
            title: 'Budget Status',
            description: `You've used ${budgetUsedPercentage}% of your monthly budget. You're spending ₹${spendingRate.toLocaleString()} per day on average.`,
            sentiment: 'neutral',
          })
        } else if (budgetUsedPercentage <= 70) {
          newInsights.push({
            type: 'success',
            title: 'Budget On Track',
            description: `You've only used ${budgetUsedPercentage}% of your monthly budget. You're ₹${(expectedSpendByNow - totalSpent).toLocaleString()} below expected spending!`,
            sentiment: 'positive',
          })
        }
      }
      
      // Category insights with more detailed analysis
      if (categorySummary.length >= 2) {
        const topCategory = categorySummary[0]
        const secondCategory = categorySummary[1]
        
        // Spending concentration analysis
        if (topCategory.percentage > 50) {
          newInsights.push({
            type: 'warning',
            title: 'Spending Concentration',
            description: `${topCategory.percentage}% of your spending is on ${topCategory.category}. Consider diversifying your expenses to better manage your budget.`,
            sentiment: 'negative',
          })
        }

        // Category comparison insights
        if (topCategory.percentage > secondCategory.percentage * 2) {
          newInsights.push({
            type: 'info',
            title: 'Category Balance',
            description: `Your spending on ${topCategory.category} is more than double that of ${secondCategory.category}. Consider if this distribution aligns with your priorities.`,
            sentiment: 'neutral',
          })
        }

        // Essential vs Non-essential categories
        const essentialCategories = ['Food', 'Transportation', 'Housing', 'Utilities']
        const nonEssentialCategories = ['Entertainment', 'Shopping', 'Dining Out', 'Travel']
        
        const essentialSpending = categorySummary
          .filter(cat => essentialCategories.includes(cat.category))
          .reduce((sum, cat) => sum + cat.percentage, 0)
        
        const nonEssentialSpending = categorySummary
          .filter(cat => nonEssentialCategories.includes(cat.category))
          .reduce((sum, cat) => sum + cat.percentage, 0)

        if (nonEssentialSpending > 40) {
          newInsights.push({
            type: 'warning',
            title: 'Spending Priorities',
            description: `${nonEssentialSpending}% of your spending is on non-essential categories. Consider reviewing these expenses to increase savings.`,
            sentiment: 'negative',
          })
        }

        // Category-specific advice
        categorySummary.forEach(category => {
          if (category.category === 'Food' && category.percentage > 30) {
            newInsights.push({
              type: 'info',
              title: 'Food Expenses',
              description: `You're spending ${category.percentage}% of your budget on food. Consider meal planning and bulk buying to reduce costs.`,
              sentiment: 'neutral',
            })
          }
          if (category.category === 'Entertainment' && category.percentage > 20) {
            newInsights.push({
              type: 'warning',
              title: 'Entertainment Spending',
              description: `Entertainment makes up ${category.percentage}% of your expenses. Look for free or lower-cost alternatives.`,
              sentiment: 'negative',
            })
          }
        })
      }
      
      // Daily spending trends with more detailed analysis
      if (dailySpending.length > 0) {
        const last7Days = dailySpending.slice(-7)
        const last7DaysTotal = last7Days.reduce((sum, day) => sum + day.amount, 0)
        const averageDaily = last7DaysTotal / 7
        const weekdays = last7Days.filter(day => {
          const dayOfWeek = new Date(day.date).getDay()
          return dayOfWeek !== 0 && dayOfWeek !== 6
        })
        const weekends = last7Days.filter(day => {
          const dayOfWeek = new Date(day.date).getDay()
          return dayOfWeek === 0 || dayOfWeek === 6
        })

        // Weekend vs Weekday spending
        if (weekends.length > 0 && weekdays.length > 0) {
          const weekendAvg = weekends.reduce((sum, day) => sum + day.amount, 0) / weekends.length
          const weekdayAvg = weekdays.reduce((sum, day) => sum + day.amount, 0) / weekdays.length
          
          if (weekendAvg > weekdayAvg * 1.5) {
            newInsights.push({
              type: 'warning',
              title: 'Weekend Spending',
              description: `Your weekend spending (₹${weekendAvg.toLocaleString()}) is significantly higher than weekday spending (₹${weekdayAvg.toLocaleString()}). Consider planning weekend activities with a budget in mind.`,
              sentiment: 'negative',
            })
          }
        }

        // Spending consistency
        const spendingVariance = last7Days.reduce((sum, day) => {
          return sum + Math.pow(day.amount - averageDaily, 2)
        }, 0) / 7

        if (spendingVariance > Math.pow(averageDaily, 2)) {
          newInsights.push({
            type: 'info',
            title: 'Spending Consistency',
            description: 'Your daily spending varies significantly. Try to maintain more consistent spending patterns for better budget management.',
            sentiment: 'neutral',
          })
        }

        // No-spend streak
        let streak = 0
        for (let i = dailySpending.length - 1; i >= 0; i--) {
          if (dailySpending[i].amount === 0) streak++
          else break
        }
        if (streak >= 2) {
          newInsights.push({
            type: 'success',
            title: 'No-Spend Streak',
            description: `You've had ${streak} day${streak > 1 ? 's' : ''} in a row with no spending. This is a great way to build savings!`,
            sentiment: 'positive',
          })
        }
      }
      
      // Savings opportunity insights
      if (categorySummary.length > 0) {
        const potentialSavings = categorySummary
          .filter(cat => cat.percentage > 15)
          .map(cat => ({
            category: cat.category,
            potential: Math.round(cat.amount * 0.1) // Assuming 10% reduction is possible
          }))
          .filter(saving => saving.potential > 0)

        if (potentialSavings.length > 0) {
          const totalPotential = potentialSavings.reduce((sum, saving) => sum + saving.potential, 0)
          newInsights.push({
            type: 'success',
            title: 'Savings Opportunity',
            description: `You could save up to ₹${totalPotential.toLocaleString()} monthly by reducing spending in ${potentialSavings.map(s => s.category).join(', ')} by 10%.`,
            sentiment: 'positive',
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
    <div className="space-y-3 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Expense Analytics</h2>
          <p className="text-sm sm:text-base text-gray-400 mt-0.5 sm:mt-1">
            Visualize and analyze your spending patterns to make better financial decisions.
          </p>
        </div>
        <div className="mt-1.5 sm:mt-0">
          <Button variant="outline" className="w-full sm:w-auto rounded-full bg-indigo-600/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 hover:text-indigo-300">
            <LineChart className="h-4 w-4 mr-2" />
            Statistics
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-[#121828]/80 backdrop-blur-sm border border-[#232b3b]/50 shadow-sm rounded-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-400/80 to-blue-500/80"></div>
          <div className="p-2.5 sm:p-4">
            <div className="flex items-center mb-1.5 sm:mb-3">
              <div className="rounded-full bg-blue-900/20 p-1 mr-2">
                <LineChart className="h-4 w-4 text-blue-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-300">Top Categories</h3>
            </div>
            {categorySummary.length > 0 ? (
              <div className="space-y-1.5 sm:space-y-2">
                {categorySummary.slice(0, 3).map((category, index) => (
                  <div key={category.category} className="flex items-center text-gray-400 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500/80 mr-2"></div>
                    <span className="truncate flex-1">{category.category}</span>
                    <span className="ml-2 whitespace-nowrap">₹{category.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Add expenses to see top categories</p>
            )}
          </div>
        </div>

        <div className="bg-[#121828]/80 backdrop-blur-sm border border-[#232b3b]/50 shadow-sm rounded-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-green-400/80 to-emerald-500/80"></div>
          <div className="p-2.5 sm:p-4">
            <div className="flex items-center mb-1.5 sm:mb-3">
              <div className="rounded-full bg-green-900/20 p-1 mr-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-300">7 Day Trend</h3>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              ₹{dailySpending.slice(-7).reduce((sum, day) => sum + day.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-400 mt-0.5 sm:mt-1">
              vs ₹0 previous week
            </p>
          </div>
        </div>

        <div className="bg-[#121828]/80 backdrop-blur-sm border border-[#232b3b]/50 shadow-sm rounded-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-400/80 to-yellow-500/80"></div>
          <div className="p-2.5 sm:p-4">
            <div className="flex items-center mb-1.5 sm:mb-3">
              <div className="rounded-full bg-amber-900/20 p-1 mr-2">
                <Tag className="h-4 w-4 text-amber-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-300">Largest Expense</h3>
            </div>
            {dailySpending.length > 0 ? (
              <>
                <div className="text-xl sm:text-2xl font-bold text-white">
                  ₹{Math.max(...dailySpending.map(day => day.amount)).toLocaleString()}
                </div>
                <div className="mt-0.5 sm:mt-1">
                  <span className="px-1.5 py-0.5 bg-amber-900/20 text-amber-400 rounded-full text-xs">
                    {categorySummary.length > 0 ? categorySummary[0].category : 'Food'}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-sm">Add expenses to see largest expense</p>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2 sm:space-y-4 mt-2 sm:mt-4">
        {/* Mobile: Nicer custom dropdown for tabs */}
        <div className="w-full mb-1.5 sm:mb-2 sm:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full rounded-lg bg-[#121828]/80 backdrop-blur-sm border border-[#232b3b]/50 text-indigo-300 font-semibold py-1.5 sm:py-2 px-2.5 sm:px-3 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="insights">Insights</SelectItem>
              <SelectItem value="categories">Categories</SelectItem>
              <SelectItem value="trends">Spending Trends</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Original tab list - Remove "dropdown" text */}
        <TabsList className="hidden sm:flex w-full bg-transparent border-b border-[#232b3b]/50 mb-2">
          <TabsTrigger value="insights" className={`relative flex-1 flex items-center justify-center gap-2 px-0 py-2 font-semibold text-sm sm:text-base transition-all duration-200 bg-transparent border-none outline-none ${activeTab === 'insights' ? 'text-primary font-bold' : 'text-gray-400 hover:text-primary font-normal'}`}>Insights</TabsTrigger>
          <TabsTrigger value="categories" className={`relative flex-1 flex items-center justify-center gap-2 px-0 py-2 font-semibold text-sm sm:text-base transition-all duration-200 bg-transparent border-none outline-none ${activeTab === 'categories' ? 'text-primary font-bold' : 'text-gray-400 hover:text-primary font-normal'}`}>Categories</TabsTrigger>
          <TabsTrigger value="trends" className={`relative flex-1 flex items-center justify-center gap-2 px-0 py-2 font-semibold text-sm sm:text-base transition-all duration-200 bg-transparent border-none outline-none ${activeTab === 'trends' ? 'text-primary font-bold' : 'text-gray-400 hover:text-primary font-normal'}`}>Spending Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-2 sm:space-y-4">
          <div className="flex gap-1.5 sm:gap-2 mb-2 sm:mb-4 overflow-x-auto pb-1.5 sm:pb-2">
            <Button
              variant={insightFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              className={`${insightFilter === 'all' ? 'bg-indigo-600/80 text-white font-bold' : 'text-gray-400 bg-[#121828]/80 border-[#232b3b]/50'} py-1 sm:py-1.5 px-2 sm:px-3`}
              onClick={() => setInsightFilter('all')}
            >All</Button>
            <Button
              variant={insightFilter === 'positive' ? 'default' : 'outline'}
              size="sm"
              className={`${insightFilter === 'positive' ? 'bg-emerald-600/80 text-white font-bold' : 'text-gray-400 bg-[#121828]/80 border-[#232b3b]/50'} py-1 sm:py-1.5 px-2 sm:px-3`}
              onClick={() => setInsightFilter('positive')}
            >Positive</Button>
            <Button
              variant={insightFilter === 'negative' ? 'default' : 'outline'}
              size="sm"
              className={`${insightFilter === 'negative' ? 'bg-orange-600/80 text-white font-bold' : 'text-gray-400 bg-[#121828]/80 border-[#232b3b]/50'} py-1 sm:py-1.5 px-2 sm:px-3`}
              onClick={() => setInsightFilter('negative')}
            >Negative</Button>
          </div>
          {insights.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              {insights
                .filter(insight =>
                  insightFilter === 'all' ? true :
                  insightFilter === 'positive' ? insight.sentiment === 'positive' :
                  insightFilter === 'negative' ? insight.sentiment === 'negative' : true
                )
                .map((insight, index) => (
                  <Card 
                    key={index} 
                    className={`bg-[#121828]/80 backdrop-blur-sm border border-[#232b3b]/50 shadow-sm rounded-xl overflow-hidden transform transition-all duration-200 hover:scale-[1.01] ${
                      insight.type === 'warning' 
                        ? 'border-l-4 border-l-orange-500/80 hover:shadow-orange-500/10' 
                        : insight.type === 'success' 
                          ? 'border-l-4 border-l-emerald-500/80 hover:shadow-emerald-500/10' 
                        : 'border-l-4 border-l-blue-500/80 hover:shadow-blue-500/10'
                    }`}
                  >
                    <div className={`h-1 bg-gradient-to-r ${
                      insight.type === 'warning' 
                        ? 'from-orange-400/80 to-orange-500/80' 
                        : insight.type === 'success' 
                          ? 'from-emerald-400/80 to-emerald-500/80' 
                        : 'from-blue-400/80 to-blue-500/80'
                    }`}></div>
                    <CardHeader className="py-2 px-2.5 sm:py-4 sm:px-6">
                      <div className="flex items-center gap-1.5 sm:gap-3">
                        {insight.type === 'warning' ? (
                          <div className="rounded-full bg-orange-500/20 p-1 sm:p-2">
                            <AlertTriangle className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-orange-500" />
                          </div>
                        ) : insight.type === 'success' ? (
                          <div className="rounded-full bg-emerald-500/20 p-1 sm:p-2">
                            <LineChart className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-emerald-500" />
                          </div>
                        ) : (
                          <div className="rounded-full bg-blue-500/20 p-1 sm:p-2">
                            <Info className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-blue-500" />
                          </div>
                        )}
                        <CardTitle className="text-base sm:text-lg font-bold text-white">{insight.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="py-0 pb-2 px-2.5 sm:pb-4 sm:px-6">
                      <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                        {insight.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card className="bg-[#121828]/80 backdrop-blur-sm border border-[#232b3b]/50 shadow-sm rounded-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-400/80 to-indigo-500/80"></div>
              <CardContent className="py-6 sm:py-10 text-center">
                <div className="rounded-full bg-blue-500/20 p-1.5 sm:p-3 w-fit mx-auto mb-2 sm:mb-4">
                  <Info className="h-4 w-4 sm:h-6 sm:w-6 text-blue-500" />
                </div>
                <p className="text-base sm:text-lg text-gray-300">
                  Add more expenses to generate personalized insights.
                </p>
                <p className="text-sm sm:text-base text-gray-400 mt-1 sm:mt-2">
                  We'll analyze your spending patterns and provide actionable recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories">
          <Card className="bg-[#121828]/80 backdrop-blur-sm border border-[#232b3b]/50 shadow-sm rounded-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-400/80 to-indigo-500/80"></div>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2 p-2.5 sm:p-6">
              <div className="w-full">
                <CardTitle className="text-base sm:text-xl text-gray-300">Category Breakdown</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">
                  View how your spending is distributed across different categories
                </CardDescription>
              </div>
              {categorySummary.length > 0 && (
                <div className="w-full sm:w-auto mt-1.5 sm:mt-0">
                  <div className="flex w-full sm:hidden gap-1 sm:gap-1.5 bg-[#1a2234]/50 p-0.5 sm:p-1 rounded-lg">
                    <button
                      className={`flex-1 py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-md text-xs font-medium transition-all duration-200 ${
                        categoryChartType === 'pie' 
                          ? 'bg-indigo-600/20 text-indigo-300 shadow' 
                          : 'bg-transparent text-gray-400 hover:text-primary'
                      }`}
                      onClick={() => setCategoryChartType('pie')}
                    >
                      <PieChart className="h-3 w-3 sm:h-3.5 sm:w-3.5 inline-block mr-0.5 sm:mr-1" />
                      Pie
                    </button>
                    <button
                      className={`flex-1 py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-md text-xs font-medium transition-all duration-200 ${
                        categoryChartType === 'bar' 
                          ? 'bg-indigo-600/20 text-indigo-300 shadow' 
                          : 'bg-transparent text-gray-400 hover:text-primary'
                      }`}
                      onClick={() => setCategoryChartType('bar')}
                    >
                      <BarChart className="h-3 w-3 sm:h-3.5 sm:w-3.5 inline-block mr-0.5 sm:mr-1" />
                      Bar
                    </button>
                  </div>
                  <div className="hidden sm:block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full bg-indigo-600/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 hover:text-indigo-300"
                      onClick={() => setCategoryChartType(categoryChartType === 'pie' ? 'bar' : 'pie')}
                    >
                      {categoryChartType === 'pie' ? (
                        <>
                          <BarChart className="h-4 w-4 mr-2" />
                          Switch to Bar Chart
                        </>
                      ) : (
                        <>
                          <PieChart className="h-4 w-4 mr-2" />
                          Switch to Pie Chart
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-2.5 sm:p-6">
              {categorySummary.length > 0 ? (
                <div className="h-[280px] sm:h-[400px] w-full">
                  <SwitchTransition mode="out-in">
                    <CSSTransition
                      key={categoryChartType}
                      timeout={300}
                      classNames="fade"
                    >
                      <div className="w-full h-full flex items-center justify-center">
                                                  {categoryChartType === 'pie' ? (
                            <div className="w-[80%] sm:w-full mx-auto h-[85%] sm:h-full flex items-center justify-center relative">
                              <SimplePieChart 
                               data={categorySummary}
                               hideLabels={true}
                              />
                             
                              {/* Custom legend for pie chart */}
                              <div className="absolute bottom-0 w-full">
                                <div className="flex flex-wrap gap-3 justify-center">
                                  {categorySummary.slice(0, 5).map((category, index) => (
                                    <div key={category.category} className="flex items-center text-xs">
                                      <div 
                                        className="w-2.5 h-2.5 rounded-full mr-1.5" 
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                      ></div>
                                      <span className="text-gray-300">{category.category}</span>
                                      <span className="ml-1 text-gray-400">({category.percentage}%)</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              layout="vertical"
                              data={categorySummary.slice(0, 5)}
                              margin={{ 
                                top: 5, 
                                right: 30, 
                                left: 40, 
                                bottom: 10 
                              }}
                              barSize={24}
                            >
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.3} />
                              <XAxis 
                                type="number" 
                                tickFormatter={(value) => `₹${value.toLocaleString()}`} 
                                stroke="#94a3b8"
                                tick={{ fontSize: 11, fill: '#94a3b8' }}
                                axisLine={{ stroke: '#334155' }}
                                tickLine={{ stroke: '#334155' }}
                              />
                              <YAxis 
                                type="category" 
                                dataKey="category" 
                                tick={{ fontSize: 12, fill: '#94a3b8' }} 
                                width={80} 
                                stroke="#94a3b8"
                                axisLine={{ stroke: '#334155' }}
                                tickLine={{ stroke: '#334155' }}
                              />
                              <Tooltip 
                                formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                                contentStyle={{ 
                                  backgroundColor: '#192031', 
                                  borderColor: '#334155',
                                  borderRadius: '8px',
                                  padding: '8px',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                }}
                                itemStyle={{ color: '#e2e8f0' }}
                                cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
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
                        )}
                      </div>
                    </CSSTransition>
                  </SwitchTransition>
                </div>
              ) : (
                <div className="flex h-[280px] sm:h-[400px] items-center justify-center">
                  <p className="text-center text-gray-400 text-sm">
                    Add expenses to see category breakdown
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-[#232b3b]/50 p-2.5 sm:p-6 flex flex-col sm:flex-row sm:justify-between gap-1.5 sm:gap-2">
              <div className="text-xs sm:text-sm text-gray-400">
                {categorySummary.length > 0 && 
                  `Your highest spending is on ${categorySummary[0].category} (${categorySummary[0].percentage}% of total)`}
              </div>
              {categorySummary.length > 0 && 
                <div className="text-xs sm:text-sm font-medium text-gray-300">
                  Total Categories: {categorySummary.length}
                </div>
              }
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-2 sm:space-y-4">
          <Card className="bg-[#121828]/80 backdrop-blur-sm border border-[#232b3b]/50 shadow-sm rounded-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-400/80 to-green-500/80"></div>
            <CardHeader className="p-2.5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-3">
                <div>
                  <CardTitle className="text-base sm:text-xl text-gray-300">Daily Spending Trends</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">
                    Track your spending patterns over the last 30 days
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-xs sm:text-sm text-gray-400">View:</span>
                  <Select value={trendRange} onValueChange={v => setTrendRange(v as 'week' | 'month')}>
                    <SelectTrigger className="w-[90px] sm:w-[120px] bg-[#1a2234]/50 border border-[#232b3b]/50 text-gray-200 text-xs sm:text-sm py-1 sm:py-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2.5 sm:p-6">
              <div className="h-[240px] sm:h-[400px] w-full">
                {dailySpending.length > 0 ? (
                  <div className="bg-[#1a2234]/70 rounded-lg h-full w-full p-2.5 sm:p-3">
                    <div className="h-full w-full">
                      <SwitchTransition mode="out-in">
                        <CSSTransition
                          key={trendRange}
                          timeout={300}
                          classNames="fade"
                          onEntered={() => setGraphKey(trendRange)}
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart
                              data={trendRange === 'week' ? dailySpending.slice(-7) : dailySpending}
                              margin={{ 
                                top: window.innerWidth < 640 ? 18 : 10, 
                                right: window.innerWidth < 640 ? 12 : 20, 
                                left: window.innerWidth < 640 ? 8 : 30, 
                                bottom: window.innerWidth < 640 ? 32 : 40 
                              }}
                            >
                              <CartesianGrid 
                                strokeDasharray="3 3" 
                                stroke="#334155" 
                                opacity={0.3}
                                vertical={window.innerWidth >= 640}
                                horizontal={true}
                              />
                              <XAxis 
                                dataKey="date" 
                                tickFormatter={formatDate}
                                tick={{ 
                                  fontSize: window.innerWidth < 640 ? 9 : 11, 
                                  fill: '#cbd5e1',
                                }}
                                height={window.innerWidth < 640 ? 30 : 60}
                                interval={trendRange === 'week' ? 0 : window.innerWidth < 640 ? 'preserveStartEnd' : 4}
                                stroke="#94a3b8"
                                axisLine={{ stroke: '#334155' }}
                                tickLine={{ stroke: '#334155' }}
                                tickMargin={window.innerWidth < 640 ? 5 : 10}
                                label={window.innerWidth < 640 ? {} : { 
                                  value: 'Date', 
                                  position: 'insideBottom', 
                                  offset: 0, 
                                  fill: '#cbd5e1', 
                                  fontSize: 12 
                                }}
                                textAnchor={window.innerWidth < 640 ? "middle" : undefined}
                              />
                              <YAxis 
                                tickFormatter={(value) => window.innerWidth < 640 ? 
                                  (value >= 1000 ? `₹${Math.round(value/1000)}k` : `₹${Math.round(value)}`) 
                                  : `₹${value.toLocaleString()}`}
                                stroke="#94a3b8"
                                tick={{ 
                                  fontSize: window.innerWidth < 640 ? 9 : 11, 
                                  fill: '#cbd5e1' 
                                }}
                                axisLine={{ stroke: '#334155' }}
                                tickLine={{ stroke: '#334155' }}
                                width={window.innerWidth < 640 ? 30 : 60}
                                tickCount={window.innerWidth < 640 ? 4 : 7}
                                domain={['dataMin - 100', 'dataMax + 100']}
                                label={window.innerWidth < 640 ? undefined : { 
                                  value: 'Amount (₹)', 
                                  angle: -90, 
                                  position: 'insideLeft', 
                                  fill: '#cbd5e1', 
                                  fontSize: 12, 
                                  offset: -5 
                                }}
                              />
                              <Tooltip 
                                formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
                                labelFormatter={(value) => `${formatDate(value)}`}
                                contentStyle={{ 
                                  backgroundColor: '#232b3b', 
                                  borderColor: '#334155', 
                                  borderRadius: 8, 
                                  padding: window.innerWidth < 640 ? '4px' : '8px',
                                  fontSize: window.innerWidth < 640 ? '10px' : '13px'
                                }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                                isAnimationActive={true}
                                wrapperStyle={window.innerWidth < 640 ? { zIndex: 1000 } : undefined}
                              />
                              <defs>
                                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <Line
                                type="monotone"
                                dataKey="amount"
                                stroke="#6366f1"
                                strokeWidth={window.innerWidth < 640 ? 1.5 : 2}
                                dot={{ 
                                  r: window.innerWidth < 640 ? 2 : 4, 
                                  fill: '#fff', 
                                  stroke: '#6366f1', 
                                  strokeWidth: window.innerWidth < 640 ? 1 : 2 
                                }}
                                activeDot={{ 
                                  r: window.innerWidth < 640 ? 4 : 6, 
                                  fill: '#6366f1', 
                                  stroke: '#fff', 
                                  strokeWidth: window.innerWidth < 640 ? 1 : 2 
                                }}
                                animationBegin={0}
                                animationDuration={1500}
                                animationEasing="ease-out"
                              />
                              <Area
                                type="monotone"
                                dataKey="amount"
                                fill="url(#lineGradient)"
                                stroke="none"
                                animationDuration={1500}
                              />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </CSSTransition>
                      </SwitchTransition>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center bg-[#1a2234]/70 rounded-lg">
                    <p className="text-center text-gray-400 text-sm">
                      Add expenses to see daily spending trends
                    </p>
                  </div>
                )}
              </div>
              {dailySpending.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-3 mt-2 sm:mt-4">
                  <div className="bg-[#1a2234]/50 rounded-lg p-2 sm:p-3">
                    <h4 className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 text-gray-400">Last 7 Days</h4>
                    <div className="text-base sm:text-xl font-bold text-white">
                      ₹{dailySpending.slice(-7).reduce((sum, day) => sum + day.amount, 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 sm:mt-1">
                      Total spending in past week
                    </p>
                  </div>
                  <div className="bg-[#1a2234]/50 rounded-lg p-2 sm:p-3">
                    <h4 className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 text-gray-400">Daily Average</h4>
                    <div className="text-base sm:text-xl font-bold text-white">
                      ₹{Math.round(dailySpending.slice(-30).reduce((sum, day) => sum + day.amount, 0) / 30).toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 sm:mt-1">
                      Average daily expense
                    </p>
                  </div>
                  <div className="bg-[#1a2234]/50 rounded-lg p-2 sm:p-3">
                    <h4 className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 text-gray-400">Highest Day</h4>
                    {(() => {
                      const highestDay = [...dailySpending].sort((a, b) => b.amount - a.amount)[0];
                      return (
                        <>
                          <div className="text-base sm:text-xl font-bold text-white">
                            ₹{highestDay.amount.toLocaleString()}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 sm:mt-1">
                            on {formatDate(highestDay.date)}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-[#232b3b]/50 p-2.5 sm:p-6">
              <div className="text-xs sm:text-sm text-gray-400">
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