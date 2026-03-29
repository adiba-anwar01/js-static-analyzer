import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart2, ChevronDown, ChevronUp } from 'lucide-react';

const SEVERITY_COLORS_CHART = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#3b82f6',
};

const PIE_COLORS = ['#ef4444', '#f59e0b', '#3b82f6'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <p className="font-semibold text-slate-700 dark:text-slate-200">{payload[0].name}</p>
        <p className="text-slate-500 dark:text-slate-400">Count: <span className="font-bold text-slate-800 dark:text-white">{payload[0].value}</span></p>
      </div>
    );
  }
  return null;
};

export default function StatsDashboard({ stats, warnings }) {
  const [collapsed, setCollapsed] = useState(false);

  const pieData = [
    { name: 'High', value: stats.high },
    { name: 'Medium', value: stats.medium },
    { name: 'Low', value: stats.low },
  ].filter((d) => d.value > 0);

  const typeData = Object.entries(stats.byType || {})
    .map(([name, count]) => ({ name: name.length > 20 ? `${name.slice(0, 18)}...` : name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="shrink-0 border-t border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <button
        className="section-header w-full transition hover:bg-slate-50 dark:hover:bg-slate-800"
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex items-center gap-2">
          <BarChart2 size={14} className="text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Statistics Dashboard
          </span>
          <span className="badge badge-info">{stats.total} warnings</span>
        </div>
        {collapsed ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronUp size={14} className="text-slate-400" />}
      </button>

      {!collapsed && (
        <div className="flex gap-4 overflow-x-auto px-4 py-3">
          {pieData.length > 0 && (
            <div className="shrink-0">
              <p className="mb-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                By Severity
              </p>
              <ResponsiveContainer width={160} height={120}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={50}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={PIE_COLORS[['High', 'Medium', 'Low'].indexOf(entry.name)]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {typeData.length > 0 && (
            <div className="min-w-[280px] flex-1">
              <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                By Rule Type
              </p>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={typeData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {typeData.map((entry, index) => {
                      const sample = warnings.find((w) =>
                        w.type === Object.keys(stats.byType)[index] ||
                        w.type.startsWith(entry.name.replace('...', ''))
                      );
                      const sev = sample?.severity || 'Low';
                      return (
                        <Cell key={index} fill={SEVERITY_COLORS_CHART[sev] || '#4f46e5'} />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid shrink-0 grid-cols-2 content-start gap-2">
            {[
              { label: 'Total Issues', value: stats.total, color: 'text-indigo-600 dark:text-indigo-400' },
              { label: 'High Risk', value: stats.high, color: 'text-red-500' },
              { label: 'Medium Risk', value: stats.medium, color: 'text-amber-500' },
              { label: 'Low Risk', value: stats.low, color: 'text-blue-500' },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="min-w-[80px] rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800"
              >
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs leading-tight text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
