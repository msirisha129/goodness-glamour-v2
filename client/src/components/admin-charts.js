import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts';
const CHART_COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
    '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'
];
// Pie Chart Component for User Registrations
export function UserRegistrationPieChart({ data, height = 300, className }) {
    return (_jsx("div", { className: `${className} bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 shadow-lg rounded-xl p-6`, children: _jsx(ResponsiveContainer, { width: "100%", height: height, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, cx: "50%", cy: "50%", labelLine: false, label: ({ name, percent }) => {
                            const percentage = Number((percent * 100).toFixed(0));
                            return percentage > 5 ? `${percentage}%` : '';
                        }, outerRadius: 80, fill: "#8884d8", dataKey: "value", children: data.map((entry, index) => (_jsx(Cell, { fill: CHART_COLORS[index % CHART_COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: {
                            backgroundColor: '#1F2937',
                            border: '1px solid #4B5563',
                            borderRadius: '12px',
                            color: '#F9FAFB',
                            fontSize: '14px',
                            fontWeight: '500',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        } }), _jsx(Legend, {})] }) }) }));
}
// Bar Chart Component for Booking Trends
export function BookingTrendsBarChart({ data, height = 300, className }) {
    return (_jsx("div", { className: `${className} bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 shadow-lg rounded-xl p-6`, children: _jsx(ResponsiveContainer, { width: "100%", height: height, children: _jsxs(BarChart, { data: data, margin: { top: 20, right: 30, left: 20, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#E5E7EB", strokeWidth: 1 }), _jsx(XAxis, { dataKey: "date", stroke: "#6B7280", fontSize: 12, tick: { fill: '#374151', fontWeight: '500' } }), _jsx(YAxis, { stroke: "#6B7280", fontSize: 12, tick: { fill: '#374151', fontWeight: '500' } }), _jsx(Tooltip, { contentStyle: {
                            backgroundColor: '#1F2937',
                            border: '1px solid #4B5563',
                            borderRadius: '12px',
                            color: '#F9FAFB',
                            fontSize: '14px',
                            fontWeight: '500',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        } }), _jsx(Legend, {}), _jsx(Bar, { dataKey: "count", fill: "#3B82F6", name: "Bookings", radius: [4, 4, 0, 0] }), _jsx(Bar, { dataKey: "revenue", fill: "#10B981", name: "Revenue (\u20B9)", radius: [4, 4, 0, 0] })] }) }) }));
}
// Line Chart Component for User Growth
export function UserGrowthLineChart({ data, height = 300, className }) {
    return (_jsx("div", { className: `${className} bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 shadow-lg rounded-xl p-6`, children: _jsx(ResponsiveContainer, { width: "100%", height: height, children: _jsxs(LineChart, { data: data, margin: { top: 20, right: 30, left: 20, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#E5E7EB", strokeWidth: 1 }), _jsx(XAxis, { dataKey: "date", stroke: "#6B7280", fontSize: 12, tick: { fill: '#374151', fontWeight: '500' } }), _jsx(YAxis, { stroke: "#6B7280", fontSize: 12, tick: { fill: '#374151', fontWeight: '500' } }), _jsx(Tooltip, { contentStyle: {
                            backgroundColor: '#1F2937',
                            border: '1px solid #4B5563',
                            borderRadius: '12px',
                            color: '#F9FAFB',
                            fontSize: '14px',
                            fontWeight: '500',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        } }), _jsx(Legend, {}), _jsx(Line, { type: "monotone", dataKey: "count", stroke: "#3B82F6", strokeWidth: 3, dot: { fill: '#3B82F6', strokeWidth: 2, r: 4 }, activeDot: { r: 6, fill: '#3B82F6' }, name: "User Registrations" })] }) }) }));
}
// Pie Chart Component for Service Categories
export function ServiceCategoriesPieChart({ data, height = 400, className }) {
    const topFive = Array.isArray(data)
        ? [...data].sort((a, b) => (b.value || 0) - (a.value || 0)).slice(0, 5)
        : [];
    const total = topFive.reduce((s, d) => s + (d.value || 0), 0);
    return (_jsx("div", { className: `${className} bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 shadow-lg rounded-xl p-6`, children: _jsx(ResponsiveContainer, { width: "100%", height: height, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: topFive, cx: "50%", cy: "50%", labelLine: false, label: ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                            const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                            const percentage = Number((percent * 100).toFixed(0));
                            return percentage > 8 ? (_jsx("text", { x: x, y: y, fill: "white", textAnchor: "middle", dominantBaseline: "central", fontSize: "14", fontWeight: "600", children: `${percentage}%` })) : null;
                        }, outerRadius: 140, innerRadius: 0, paddingAngle: 1, minAngle: 2, fill: "#8884d8", dataKey: "value", isAnimationActive: false, children: topFive.map((entry, index) => (_jsx(Cell, { fill: CHART_COLORS[index % CHART_COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: {
                            backgroundColor: '#1F2937',
                            border: '1px solid #4B5563',
                            borderRadius: '12px',
                            color: '#FFFFFF',
                            fontSize: '14px',
                            fontWeight: '600',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }, formatter: (value, name) => [
                            _jsxs("div", { style: { color: '#FFFFFF', textAlign: 'center' }, children: [_jsx("div", { style: { fontWeight: '600', fontSize: '14px', marginBottom: '4px' }, children: name }), _jsxs("div", { style: { fontSize: '12px', opacity: 0.9 }, children: [value, " bookings"] })] }, "tooltip-content")
                        ], labelStyle: { color: '#FFFFFF', fontWeight: '600' } })] }) }) }));
}
// Area Chart Component for Revenue Trends
export function RevenueTrendsAreaChart({ data, height = 300, className }) {
    return (_jsx("div", { className: `${className} bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 shadow-lg rounded-xl p-6`, children: _jsx(ResponsiveContainer, { width: "100%", height: height, children: _jsxs(AreaChart, { data: data, margin: { top: 20, right: 30, left: 20, bottom: 5 }, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "revenueGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#10B981", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#10B981", stopOpacity: 0.1 })] }) }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#E5E7EB", strokeWidth: 1 }), _jsx(XAxis, { dataKey: "date", stroke: "#6B7280", fontSize: 12, tick: { fill: '#374151', fontWeight: '500' } }), _jsx(YAxis, { stroke: "#6B7280", fontSize: 12, tick: { fill: '#374151', fontWeight: '500' } }), _jsx(Tooltip, { contentStyle: {
                            backgroundColor: '#374151',
                            border: '1px solid #6B7280',
                            borderRadius: '8px',
                            color: '#F9FAFB'
                        }, formatter: (value) => [`₹${value.toLocaleString()}`, 'Revenue'] }), _jsx(Area, { type: "monotone", dataKey: "revenue", stroke: "#10B981", strokeWidth: 2, fillOpacity: 1, fill: "url(#revenueGradient)", name: "Revenue" })] }) }) }));
}
// Bar Chart Component for Message Trends
export function MessageTrendsBarChart({ data, height = 300, className }) {
    return (_jsx("div", { className: `${className} bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 shadow-lg rounded-xl p-6`, children: _jsx(ResponsiveContainer, { width: "100%", height: height, children: _jsxs(BarChart, { data: data, margin: { top: 20, right: 30, left: 20, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#E5E7EB", strokeWidth: 1 }), _jsx(XAxis, { dataKey: "date", stroke: "#6B7280", fontSize: 12, tick: { fill: '#374151', fontWeight: '500' } }), _jsx(YAxis, { stroke: "#6B7280", fontSize: 12, tick: { fill: '#374151', fontWeight: '500' } }), _jsx(Tooltip, { contentStyle: {
                            backgroundColor: '#1F2937',
                            border: '1px solid #4B5563',
                            borderRadius: '12px',
                            color: '#F9FAFB',
                            fontSize: '14px',
                            fontWeight: '500',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        } }), _jsx(Legend, {}), _jsx(Bar, { dataKey: "count", fill: "#8B5CF6", name: "Messages", radius: [4, 4, 0, 0] })] }) }) }));
}
// Pie Chart Component for Booking Status
export function BookingStatusPieChart({ data, height = 300, className }) {
    return (_jsx("div", { className: `${className} bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 shadow-lg rounded-xl p-6`, children: _jsx(ResponsiveContainer, { width: "100%", height: height, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, cx: "50%", cy: "50%", labelLine: false, label: ({ name, percent }) => {
                            const percentage = Number((percent * 100).toFixed(0));
                            return percentage > 5 ? `${percentage}%` : '';
                        }, outerRadius: 80, fill: "#8884d8", dataKey: "value", children: data.map((entry, index) => (_jsx(Cell, { fill: CHART_COLORS[index % CHART_COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: {
                            backgroundColor: '#1F2937',
                            border: '1px solid #4B5563',
                            borderRadius: '12px',
                            color: '#F9FAFB',
                            fontSize: '14px',
                            fontWeight: '500',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        } }), _jsx(Legend, {})] }) }) }));
}
export function StatCard({ title, value, subtitle, icon, trend }) {
    return (_jsx("div", { className: "bg-white border border-gray-200 rounded-lg p-6 shadow-sm", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: title }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: value }), subtitle && _jsx("p", { className: "text-xs text-gray-500 mt-1", children: subtitle }), trend && (_jsxs("div", { className: `flex items-center mt-2 text-xs ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`, children: [_jsx("span", { children: trend.isPositive ? '↗' : '↘' }), _jsxs("span", { className: "ml-1", children: [Math.abs(trend.value).toFixed(1), "%"] })] }))] }), icon && (_jsx("div", { className: "text-amber-800", children: icon }))] }) }));
}
