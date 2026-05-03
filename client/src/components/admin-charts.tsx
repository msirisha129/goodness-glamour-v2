import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const CHART_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
  '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'
];

interface ChartProps {
  data: any[];
  height?: number;
  className?: string;
}

// Pie Chart Component for User Registrations
export function UserRegistrationPieChart({ data, height = 300, className }: ChartProps) {
  return (
    <div className={`${className} bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 shadow-lg rounded-xl p-6`}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => {
              const percentage = Number((percent * 100).toFixed(0));
              return percentage > 5 ? `${percentage}%` : '';
            }}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #4B5563',
              borderRadius: '12px',
              color: '#F9FAFB',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Bar Chart Component for Booking Trends
export function BookingTrendsBarChart({ data, height = 300, className }: ChartProps) {
  return (
    <div className={`${className} bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 shadow-lg rounded-xl p-6`}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeWidth={1} />
          <XAxis 
            dataKey="date" 
            stroke="#6B7280"
            fontSize={12}
            tick={{ fill: '#374151', fontWeight: '500' }}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            tick={{ fill: '#374151', fontWeight: '500' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #4B5563',
              borderRadius: '12px',
              color: '#F9FAFB',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          />
          <Legend />
          <Bar dataKey="count" fill="#3B82F6" name="Bookings" radius={[4, 4, 0, 0]} />
          <Bar dataKey="revenue" fill="#10B981" name="Revenue (₹)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Line Chart Component for User Growth
export function UserGrowthLineChart({ data, height = 300, className }: ChartProps) {
  return (
    <div className={`${className} bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 shadow-lg rounded-xl p-6`}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeWidth={1} />
          <XAxis 
            dataKey="date" 
            stroke="#6B7280"
            fontSize={12}
            tick={{ fill: '#374151', fontWeight: '500' }}
          />
          
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            tick={{ fill: '#374151', fontWeight: '500' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #4B5563',
              borderRadius: '12px',
              color: '#F9FAFB',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#3B82F6" 
            strokeWidth={3}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#3B82F6' }}
            name="User Registrations"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Pie Chart Component for Service Categories
export function ServiceCategoriesPieChart({ data, height = 400, className }: ChartProps) {
  const topFive = Array.isArray(data)
    ? [...data].sort((a, b) => (b.value || 0) - (a.value || 0)).slice(0, 5)
    : [];
  
  const total = topFive.reduce((s, d) => s + (d.value || 0), 0);

  return (
    <div className={`${className} bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 shadow-lg rounded-xl p-6`}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={topFive}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
              const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
              const percentage = Number((percent * 100).toFixed(0));

              return percentage > 8 ? (
                <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="600">
                  {`${percentage}%`}
                </text>
              ) : null;
            }}
            outerRadius={140}
            innerRadius={0}
            paddingAngle={1}
            minAngle={2}
            fill="#8884d8"
            dataKey="value"
            isAnimationActive={false}
          >
            {topFive.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #4B5563',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            formatter={(value: number, name: string) => [
              <div key="tooltip-content" style={{ color: '#FFFFFF', textAlign: 'center' }}>
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                  {name}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                  {value} bookings
                </div>
              </div>
            ]}
            labelStyle={{ color: '#FFFFFF', fontWeight: '600' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Area Chart Component for Revenue Trends
export function RevenueTrendsAreaChart({ data, height = 300, className }: ChartProps) {
  return (
    <div className={`${className} bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 shadow-lg rounded-xl p-6`}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeWidth={1} />
          <XAxis 
            dataKey="date" 
            stroke="#6B7280"
            fontSize={12}
            tick={{ fill: '#374151', fontWeight: '500' }}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            tick={{ fill: '#374151', fontWeight: '500' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#374151', 
              border: '1px solid #6B7280',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
            formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#10B981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#revenueGradient)"
            name="Revenue"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Bar Chart Component for Message Trends
export function MessageTrendsBarChart({ data, height = 300, className }: ChartProps) {
  return (
    <div className={`${className} bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 shadow-lg rounded-xl p-6`}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeWidth={1} />
          <XAxis 
            dataKey="date" 
            stroke="#6B7280"
            fontSize={12}
            tick={{ fill: '#374151', fontWeight: '500' }}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            tick={{ fill: '#374151', fontWeight: '500' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #4B5563',
              borderRadius: '12px',
              color: '#F9FAFB',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          />
          <Legend />
          <Bar dataKey="count" fill="#8B5CF6" name="Messages" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Pie Chart Component for Booking Status
export function BookingStatusPieChart({ data, height = 300, className }: ChartProps) {
  return (
    <div className={`${className} bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 shadow-lg rounded-xl p-6`}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => {
              const percentage = Number((percent * 100).toFixed(0));
              return percentage > 5 ? `${percentage}%` : '';
            }}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #4B5563',
              borderRadius: '12px',
              color: '#F9FAFB',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-2 text-xs ${
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              <span>{trend.isPositive ? '↗' : '↘'}</span>
              <span className="ml-1">{Math.abs(trend.value).toFixed(1)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-amber-800">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
