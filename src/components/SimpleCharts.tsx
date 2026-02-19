import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface BarChartData {
  name: string;
  cases: number;
  color: string;
}

interface LineChartData {
  month: string;
  consultations: number;
}

interface PieChartData {
  group: string;
  percentage: number;
}

interface SimpleBarChartProps {
  data: BarChartData[];
  height?: number;
}

export function SimpleBarChart({ data, height = 300 }: SimpleBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="name" 
          stroke="hsl(var(--muted-foreground))" 
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Bar 
          dataKey="cases" 
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface SimpleLineChartProps {
  data: LineChartData[];
  height?: number;
}

export function SimpleLineChart({ data, height = 300 }: SimpleLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="month" 
          stroke="hsl(var(--muted-foreground))" 
          fontSize={12}
        />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="consultations" 
          stroke="hsl(var(--primary))" 
          strokeWidth={3}
          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: 'hsl(var(--primary-glow))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface SimplePieChartProps {
  data: PieChartData[];
  height?: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function SimplePieChart({ data, height = 300 }: SimplePieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ group, percentage }) => `${group} (${percentage}%)`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="percentage"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}