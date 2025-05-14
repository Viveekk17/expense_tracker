import { useState, useEffect, useRef } from 'react'
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend
} from '../../ui/chart'

type DataItem = {
  category: string;
  amount: number;
  percentage: number;
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

interface AnimatedPieChartProps {
  data: DataItem[];
}

export function AnimatedPieChart({ data }: AnimatedPieChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [reloadKey, setReloadKey] = useState(Date.now());
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    // Force re-render with new key when data changes
    setReloadKey(Date.now());
    
    // Force animation whenever the component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setReloadKey(Date.now()); // Force re-render for animation
        }
      },
      { threshold: 0.1 }
    );

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => {
      clearTimeout(timer);
      if (chartRef.current) {
        observer.unobserve(chartRef.current);
      }
    };
  }, [data]);

  // Debug: Log data
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('AnimatedPieChart data:', data);
  }, [data]);

  // Filter out invalid/zero/NaN data
  const validData = data.filter(
    (item) => typeof item.amount === 'number' && !isNaN(item.amount) && item.amount > 0
  );

  if (validData.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-center text-gray-400">
          No valid data to display
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={chartRef} 
      className={`h-full transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className={isVisible ? 'animate-spin-slow' : ''}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              key={`pie-${reloadKey}`}
              data={validData}
              cx="50%"
              cy="50%"
              labelLine={false}
              innerRadius={30}
              outerRadius={110}
              paddingAngle={2}
              fill="#8884d8"
              dataKey="amount"
              nameKey="category"
              label={({ category, percent }) =>
                `${category}: ${isNaN(percent) ? '0' : (percent * 100).toFixed(0)}%`
              }
              startAngle={180}
              endAngle={-180}
              isAnimationActive={true}
              animationBegin={0}
              animationDuration={1200}
              animationEasing="ease-in-out"
              activeIndex={activeIndex}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {validData.map((entry, index) => (
                <Cell
                  key={`cell-${index}-${reloadKey}`}
                  fill={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  stroke="#121828"
                  style={{
                    filter: activeIndex === index ? 'drop-shadow(0 0 12px #fff)' : 'none',
                    transform: activeIndex === index ? 'scale(1.07)' : 'scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)'
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
              labelFormatter={(name) => `${name}`}
              contentStyle={{ backgroundColor: '#192031', borderColor: '#334155' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend
              formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              iconSize={10}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 