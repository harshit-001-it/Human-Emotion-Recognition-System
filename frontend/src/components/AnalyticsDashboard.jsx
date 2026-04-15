import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

const AnalyticsDashboard = ({ history }) => {
  // Mock data if history is empty
  const data = history.length > 0 ? history : [
    { name: 'Happy', value: 40 },
    { name: 'Neutral', value: 25 },
    { name: 'Surprise', value: 15 },
    { name: 'Sad', value: 10 },
    { name: 'Angry', value: 5 },
    { name: 'Fear', value: 3 },
    { name: 'Disgust', value: 2 },
  ];

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 className="text-primary" /> Emotion Intelligence
        </h2>
        <div className="flex items-center gap-2 text-green-500 text-sm font-semibold">
          <TrendingUp size={16} /> +12% accuracy gain
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-sm text-white/40 mb-4 uppercase tracking-wider">Distribution</p>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171721', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className="text-sm text-white/40 mb-4 uppercase tracking-wider">Composition</p>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="text-xs text-white/40 mb-1">Total Frames</p>
          <p className="text-2xl font-bold">12.4k</p>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="text-xs text-white/40 mb-1">Avg Latency</p>
          <p className="text-2xl font-bold">84ms</p>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
          <p className="text-xs text-white/40 mb-1">Confidence</p>
          <p className="text-2xl font-bold">92%</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
