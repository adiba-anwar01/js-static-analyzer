import { useState } from 'react';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { BarChart2, ChevronDown, ChevronUp } from 'lucide-react';

const SEVERITY_COLORS_CHART = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#3b82f6',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 rounded-lg px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-slate-700 dark:text-slate-200">{payload[0].name}</p>
        <p className="text-slate-500 dark:text-slate-400">Count: <span className="font-bold text-slate-800 dark:text-white">{payload[0].value}</span></p>
      </div>
    );
  }
  return null;
};

export default function StatsDashboard({ stats, warnings }) {
  const [collapsed, setCollapsed] = useState(false);

  const severityData = [
    { name: 'High', value: stats.high },
    { name: 'Medium', value: stats.medium },
    { name: 'Low', value: stats.low },
  ].filter((d) => d.value > 0);

  const ruleTypeData = Object.entries(stats.byType || {})
    .map(([name, count]) => ({ name: name.length > 20 ? name.slice(0, 18) + '…' : name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="border-t border-slate-200 dark:border-surface-700 bg-white dark:bg-surface-900 shrink-0">
      <button
        className="section-header w-full hover:bg-slate-50 dark:hover:bg-surface-850 transition-colors"
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex items-center gap-2">
          <BarChart2 size={14} className="text-brand-500" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Statistics Dashboard
          </span>
          <span className="badge badge-info">{stats.total} warnings</span>
        </div>
        {collapsed ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronUp size={14} className="text-slate-400" />}
      </button>

      {!collapsed && (
        <div className="flex gap-4 px-4 py-3 overflow-x-auto">
          {severityData.length > 0 && (
            <div className="shrink-0">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 text-center">
                By Severity
              </p>
              <ResponsiveContainer width={160} height={120}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={50}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={index} fill={SEVERITY_COLORS_CHART[entry.name]} />
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

          {ruleTypeData.length > 0 && (
            <div className="flex-1 min-w-[280px]">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                By Rule Type
              </p>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={ruleTypeData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
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
                    {ruleTypeData.map((entry, index) => {
                      // Color bar based on whether any warning for this type is high/medium/low
                      const sample = warnings.find((w) =>
                        w.type === Object.keys(stats.byType)[index] ||
                        w.type.startsWith(entry.name.replace('…', ''))
                      );
                      const sev = sample?.severity || 'Low';
                      return (
                        <Cell key={index} fill={SEVERITY_COLORS_CHART[sev] || '#6366f1'} />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="shrink-0 grid grid-cols-2 gap-2 content-start">
            {[
              { label: 'Total Issues', value: stats.total, color: 'text-brand-500' },
              { label: 'High Risk', value: stats.high, color: 'text-red-500' },
              { label: 'Medium Risk', value: stats.medium, color: 'text-amber-500' },
              { label: 'Low Risk', value: stats.low, color: 'text-blue-500' },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="bg-slate-50 dark:bg-surface-800 rounded-lg px-3 py-2 min-w-[80px]"
              >
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
