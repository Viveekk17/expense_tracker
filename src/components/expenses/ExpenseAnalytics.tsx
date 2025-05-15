import { useState, useEffect, useRef, useLayoutEffect } from 'react'
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
    if (expenses.length > 0) {
      generateCategorySummary()
      generateDailySpending()
      generateInsights()
      // Force rerender of pie chart when expenses change
      setPieKey(Date.now())
    }
  }, [expenses, totalSpent, remainingBudget, userDetails])

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
    
    setInsights(newInsights)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Expense Analytics</h2>
          <p className="text-gray-400 mt-1">
            Visualize and analyze your spending patterns to make better financial decisions.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button variant="outline" className="w-full sm:w-auto rounded-full bg-indigo-600/20 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/30 hover:text-indigo-300">
            <LineChart className="h-4 w-4 mr-2" />
            Statistics
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-[#121828] border-0 shadow-sm rounded-xl overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-500"></div>
          <div className="p-3 sm:p-4">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="rounded-full bg-blue-900/30 p-1 mr-2">
                <LineChart className="h-4 w-4 text-blue-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-300">Top Categories</h3>
            </div>
            {categorySummary.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {categorySummary.slice(0, 3).map((category, index) => (
                  <div key={category.category} className="flex items-center text-gray-400 text-sm sm:text-base">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    <span className="truncate">{category.category}</span>
                    <span className="ml-auto whitespace-nowrap">₹{category.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm sm:text-base">Add expenses to see top categories</p>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 mt-4">
        {/* Mobile: Nicer custom dropdown for tabs */}
        <div className="w-full mb-2 sm:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full rounded-lg bg-[#232b3b] text-indigo-300 font-semibold py-2 px-3 text-base border-none focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="insights">Insights</SelectItem>
              <SelectItem value="categories">Categories</SelectItem>
              <SelectItem value="trends">Spending Trends</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Desktop: Original tab list */}
        <TabsList className="hidden sm:flex w-full bg-transparent border-b border-[#232b3b] mb-2">
          <TabsTrigger value="insights" className={`relative flex-1 flex items-center justify-center gap-2 px-0 py-2 font-semibold text-base transition-all duration-200 bg-transparent border-none outline-none ${activeTab === 'insights' ? 'text-primary font-bold' : 'text-gray-400 hover:text-primary font-normal'}`}>Insights</TabsTrigger>
          <TabsTrigger value="categories" className={`relative flex-1 flex items-center justify-center gap-2 px-0 py-2 font-semibold text-base transition-all duration-200 bg-transparent border-none outline-none ${activeTab === 'categories' ? 'text-primary font-bold' : 'text-gray-400 hover:text-primary font-normal'}`}>Categories</TabsTrigger>
          <TabsTrigger value="trends" className={`relative flex-1 flex items-center justify-center gap-2 px-0 py-2 font-semibold text-base transition-all duration-200 bg-transparent border-none outline-none ${activeTab === 'trends' ? 'text-primary font-bold' : 'text-gray-400 hover:text-primary font-normal'}`}>Spending Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={insightFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              className={`${insightFilter === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400'}`}
              onClick={() => setInsightFilter('all')}
            >All</Button>
            <Button
              variant={insightFilter === 'positive' ? 'default' : 'outline'}
              size="sm"
              className={`${insightFilter === 'positive' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-400'}`}
              onClick={() => setInsightFilter('positive')}
            >Positive</Button>
            <Button
              variant={insightFilter === 'negative' ? 'default' : 'outline'}
              size="sm"
              className={`${insightFilter === 'negative' ? 'bg-orange-600 text-white font-bold' : 'text-gray-400'}`}
              onClick={() => setInsightFilter('negative')}
            >Negative</Button>
          </div>
          {insights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights
                .filter(insight =>
                  insightFilter === 'all' ? true :
                  insightFilter === 'positive' ? insight.sentiment === 'positive' :
                  insightFilter === 'negative' ? insight.sentiment === 'negative' : true
                )
                .map((insight, index) => (
                  <Card 
                    key={index} 
                    className={`bg-[#121828] border-0 shadow-lg rounded-xl overflow-hidden transform transition-all duration-200 hover:scale-[1.02] ${
                      insight.type === 'warning' 
                        ? 'border-l-4 border-l-orange-500 hover:shadow-orange-500/20' 
                        : insight.type === 'success' 
                          ? 'border-l-4 border-l-emerald-500 hover:shadow-emerald-500/20' 
                          : 'border-l-4 border-l-blue-500 hover:shadow-blue-500/20'
                    }`}
                  >
                    <div className={`h-1 bg-gradient-to-r ${
                      insight.type === 'warning' 
                        ? 'from-orange-400 to-orange-500' 
                        : insight.type === 'success' 
                          ? 'from-emerald-400 to-emerald-500' 
                          : 'from-blue-400 to-blue-500'
                    }`}></div>
                    <CardHeader className="py-4">
                      <div className="flex items-center gap-3">
                        {insight.type === 'warning' ? (
                          <div className="rounded-full bg-orange-500/20 p-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                          </div>
                        ) : insight.type === 'success' ? (
                          <div className="rounded-full bg-emerald-500/20 p-2">
                            <LineChart className="h-5 w-5 text-emerald-500" />
                          </div>
                        ) : (
                          <div className="rounded-full bg-blue-500/20 p-2">
                            <Info className="h-5 w-5 text-blue-500" />
                          </div>
                        )}
                        <CardTitle className="text-lg font-bold text-white">{insight.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="py-0 pb-4">
                      <p className="text-gray-300 text-base leading-relaxed">
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
                <div className="rounded-full bg-blue-500/20 p-3 w-fit mx-auto mb-4">
                  <Info className="h-6 w-6 text-blue-500" />
                </div>
                <p className="text-gray-300 text-lg">
                  Add more expenses to generate personalized insights.
                </p>
                <p className="text-gray-400 mt-2">
                  We'll analyze your spending patterns and provide actionable recommendations.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="categories">
          <Card className="bg-[#121828] border-0 shadow-sm rounded-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="w-full">
                <CardTitle className="text-gray-300">Category Breakdown</CardTitle>
                <CardDescription className="text-gray-400">
                  View how your spending is distributed across different categories
                </CardDescription>
              </div>
              {/* Chart toggle: mobile as toggle group, desktop as button */}
              {categorySummary.length > 0 && (
                <div className="w-full sm:w-auto mt-2 sm:mt-0 flex gap-2">
                  {/* Mobile: toggle group */}
                  <div className="flex w-full sm:hidden gap-2">
                    <button
                      className={`flex-1 py-2 rounded-lg font-semibold transition-all duration-200 ${categoryChartType === 'pie' ? 'bg-indigo-600/20 text-indigo-300 shadow' : 'bg-transparent text-gray-400 hover:text-primary'}`}
                      onClick={() => setCategoryChartType('pie')}
                    >Pie Chart</button>
                    <button
                      className={`flex-1 py-2 rounded-lg font-semibold transition-all duration-200 ${categoryChartType === 'bar' ? 'bg-indigo-600/20 text-indigo-300 shadow' : 'bg-transparent text-gray-400 hover:text-primary'}`}
                      onClick={() => setCategoryChartType('bar')}
                    >Bar Chart</button>
                  </div>
                  {/* Desktop: single button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:block text-indigo-400 hover:text-indigo-300 bg-[#181f2a] border border-[#232b3b]"
                    onClick={() => setCategoryChartType(categoryChartType === 'pie' ? 'bar' : 'pie')}
                  >
                    {categoryChartType === 'pie' ? 'Show Bar Chart' : 'Show Pie Chart'}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="h-[120px] sm:h-[220px] md:h-[300px] w-full flex items-center justify-center px-1">
                {categorySummary.length > 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <SwitchTransition mode="out-in">
                      <CSSTransition
                        key={categoryChartType}
                        timeout={300}
                        classNames="fade"
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          {categoryChartType === 'pie' ? (
                            <SimplePieChart data={categorySummary} />
                          ) : (
                            <ResponsiveContainer width="100%" height="90%">
                              <BarChart
                                layout="vertical"
                                data={categorySummary.slice(0, 5)}
                                margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
                                <XAxis type="number" tickFormatter={(value) => `₹${value}`} stroke="#94a3b8" />
                                <YAxis 
                                  type="category" 
                                  dataKey="category" 
                                  tick={{ fontSize: 11, fill: '#94a3b8' }} 
                                  width={80} 
                                  stroke="#94a3b8" 
                                />
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
                          )}
                        </div>
                      </CSSTransition>
                    </SwitchTransition>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-center text-gray-400 text-sm sm:text-base">
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
        <TabsContent value="trends" className="space-y-4">
          <Card className="bg-[#121828] border-0 shadow-sm rounded-xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-green-500"></div>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
                  <CardTitle className="text-gray-300">Daily Spending Trends</CardTitle>
                  <CardDescription className="text-gray-400">
                    Track your spending patterns over the last 30 days
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-gray-400">View:</span>
                  <Select value={trendRange} onValueChange={v => setTrendRange(v as 'week' | 'month')}>
                    <SelectTrigger className="w-[120px] bg-[#181f2a] border border-[#232b3b] text-gray-200">
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
            <CardContent className="p-0">
              <div className="flex flex-col h-[140px] sm:h-[220px] md:h-[300px] w-full px-1">
                {dailySpending.length > 0 ? (
                  <div className="bg-[#1a2234] rounded-lg flex-1 flex flex-col w-full p-3 sm:p-4 min-h-0">
                    <h4 className="text-base sm:text-lg font-semibold mb-2 text-gray-200">Daily Spending Pattern</h4>
                    <div className="flex-1 flex items-center justify-center w-full min-h-0">
                      <div className="w-full h-full mt-4 sm:mt-8">
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
                                margin={{ top: 10, right: 20, left: 30, bottom: 40 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis 
                                  dataKey="date" 
                                  tickFormatter={formatDate}
                                  tick={{ fontSize: 11, fill: '#cbd5e1' }}
                                  height={60}
                                  interval={trendRange === 'week' ? 0 : 4}
                                  stroke="#94a3b8"
                                  label={{ value: 'Date', position: 'insideBottom', offset: 0, fill: '#cbd5e1', fontSize: 12 }}
                                />
                                <YAxis 
                                  tickFormatter={(value) => `₹${value}`}
                                  stroke="#94a3b8"
                                  tick={{ fontSize: 11, fill: '#cbd5e1' }}
                                  label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft', fill: '#cbd5e1', fontSize: 12, offset: -5 }}
                                />
                                <Tooltip 
                                  formatter={(value) => [`₹${value}`, 'Amount']}
                                  labelFormatter={(value) => `Date: ${formatDate(value)}`}
                                  contentStyle={{ backgroundColor: '#232b3b', borderColor: '#334155', borderRadius: 8, color: '#fff', fontWeight: 500, fontSize: 13 }}
                                  itemStyle={{ color: '#fff' }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="amount"
                                  stroke="#6366f1"
                                  strokeWidth={2}
                                  dot={{ r: 4, fill: '#fff', stroke: '#6366f1', strokeWidth: 2 }}
                                  activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                                  animationBegin={0}
                                  animationDuration={1500}
                                  animationEasing="ease-out"
                                />
                              </RechartsLineChart>
                            </ResponsiveContainer>
                          </CSSTransition>
                        </SwitchTransition>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-center text-gray-400 text-sm sm:text-base">
                      Add expenses to see daily spending trends
                    </p>
                  </div>
                )}
              </div>
              {dailySpending.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-4">
                  <div className="bg-[#1a2234] rounded-lg p-3 sm:p-4 shadow-sm">
                    <h4 className="text-sm font-medium mb-1 text-gray-400">Last 7 Days</h4>
                    <div className="text-xl sm:text-2xl font-bold text-white">
                      ₹{dailySpending.slice(-7).reduce((sum, day) => sum + day.amount, 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Total spending in past week
                    </p>
                  </div>
                  <div className="bg-[#1a2234] rounded-lg p-3 sm:p-4 shadow-sm">
                    <h4 className="text-sm font-medium mb-1 text-gray-400">Daily Average</h4>
                    <div className="text-xl sm:text-2xl font-bold text-white">
                      ₹{Math.round(dailySpending.slice(-30).reduce((sum, day) => sum + day.amount, 0) / 30).toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Average daily expense
                    </p>
                  </div>
                  <div className="bg-[#1a2234] rounded-lg p-3 sm:p-4 shadow-sm">
                    <h4 className="text-sm font-medium mb-1 text-gray-400">Highest Day</h4>
                    {(() => {
                      const highestDay = [...dailySpending].sort((a, b) => b.amount - a.amount)[0];
                      return (
                        <>
                          <div className="text-xl sm:text-2xl font-bold text-white">
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