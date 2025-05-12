import React from 'react';

interface BudgetProgressCircleProps {
  budget: number;
  expenses: number;
}

const BudgetProgressCircle: React.FC<BudgetProgressCircleProps> = ({ budget, expenses }) => {
  const radius = 70;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const percent = budget > 0 ? Math.min(expenses / budget, 1) : 0;
  const strokeDashoffset = circumference * (1 - percent);

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
        <circle
          stroke="#223"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          opacity={0.2}
        />
        <circle
          stroke="#4fc3f7"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-cyan-400">₹{budget - expenses >= 0 ? budget - expenses : 0}</span>
        <span className="text-base text-blue-300">Spent: ₹{expenses}</span>
      </div>
    </div>
  );
};

export default BudgetProgressCircle; 