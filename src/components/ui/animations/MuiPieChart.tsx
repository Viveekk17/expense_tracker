import { PieChart } from '@mui/x-charts/PieChart';

export function MuiPieChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-gray-400 text-center py-8">No data to display</div>;
  }

  const chartData = data.map((item, idx) => ({
    id: idx,
    value: item.amount,
    label: item.category,
  }));

  return (
    <PieChart
      width={320}
      height={320}
      series={[
        {
          data: chartData,
          innerRadius: 30,
          outerRadius: 100,
          paddingAngle: 5,
          cornerRadius: 5,
          startAngle: -45,
          endAngle: 225,
          cx: 150,
          cy: 150,
        },
      ]}
    />
  );
} 