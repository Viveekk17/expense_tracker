import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from '../../ui/chart';

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#64748b'
];

export function SimplePieChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-gray-400 text-center py-8">No data to display</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="amount"
          nameKey="category"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          wrapperStyle={{
            paddingTop: 16,
            fontWeight: 600,
            fontSize: 15,
            color: '#cbd5e1',
            display: 'flex',
            justifyContent: 'center',
            gap: 24,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
} 