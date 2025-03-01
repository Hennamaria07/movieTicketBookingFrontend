import {
    LineChart as RechartsLineChart,
    Line,
    BarChart as RechartsBarChart,
    Bar,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart as RechartsAreaChart
} from 'recharts';

interface ChartProps {
    data: any[];
    index: string;
    categories: string[];
    colors: string[];
    valueFormatter?: (value: number) => string;
    className?: string;
}

interface PieChartProps {
    data: any[];
    index: string;
    category: string;
    colors: string[];
    valueFormatter?: (value: number) => string;
    className?: string;
}

// Helper function to transform color names to hex codes
const getColorHex = (color: string): string => {
    const colorMap: { [key: string]: string } = {
        'slate': '#64748b',
        'gray': '#6b7280',
        'zinc': '#71717a',
        'neutral': '#737373',
        'stone': '#78716c',
        'red': '#ef4444',
        'orange': '#f97316',
        'amber': '#f59e0b',
        'yellow': '#eab308',
        'lime': '#84cc16',
        'green': '#22c55e',
        'emerald': '#10b981',
        'teal': '#14b8a6',
        'cyan': '#06b6d4',
        'sky': '#0ea5e9',
        'blue': '#3b82f6',
        'indigo': '#6366f1',
        'violet': '#8b5cf6',
        'purple': '#a855f3',
        'fuchsia': '#d946ef',
        'pink': '#ec4899',
        'rose': '#f43f5e',
    };

    return colorMap[color.toLowerCase()] || color;
};

export const AreaChart = ({
    data,
    index,
    categories,
    colors,
    valueFormatter = (value: number) => `${value}`,
    className = ""
}: ChartProps) => {
    return (
        <div className={`w-full h-full ${className}`}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsAreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                        dataKey={index}
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: 'rgba(107, 114, 128, 0.2)' }}
                        axisLine={{ stroke: 'rgba(107, 114, 128, 0.2)' }}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={valueFormatter}
                        tickLine={{ stroke: 'rgba(107, 114, 128, 0.2)' }}
                        axisLine={{ stroke: 'rgba(107, 114, 128, 0.2)' }}
                    />
                    <Tooltip
                        formatter={valueFormatter}
                        contentStyle={{
                            backgroundColor: 'rgb(255, 255, 255)',
                            borderRadius: '6px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            borderColor: 'rgba(229, 231, 235)'
                        }}
                    />
                    <Legend />
                    {categories.map((category, index) => (
                        <Area
                            key={category}
                            type="monotone"
                            dataKey={category}
                            fill={getColorHex(colors[index % colors.length])}
                            stroke={getColorHex(colors[index % colors.length])}
                            fillOpacity={0.3}
                            activeDot={{ r: 6 }}
                            strokeWidth={2}
                        />
                    ))}
                </RechartsAreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export const BarChart = ({
    data,
    index,
    categories,
    colors,
    valueFormatter = (value: number) => `${value}`,
    className = ""
}: ChartProps) => {
    return (
        <div className={`w-full h-full ${className}`}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                        dataKey={index}
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: 'rgba(107, 114, 128, 0.2)' }}
                        axisLine={{ stroke: 'rgba(107, 114, 128, 0.2)' }}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={valueFormatter}
                        tickLine={{ stroke: 'rgba(107, 114, 128, 0.2)' }}
                        axisLine={{ stroke: 'rgba(107, 114, 128, 0.2)' }}
                    />
                    <Tooltip
                        formatter={valueFormatter}
                        contentStyle={{
                            backgroundColor: 'rgb(255, 255, 255)',
                            borderRadius: '6px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            borderColor: 'rgba(229, 231, 235)'
                        }}
                    />
                    <Legend />
                    {categories.map((category, index) => (
                        <Bar
                            key={category}
                            dataKey={category}
                            fill={getColorHex(colors[index % colors.length])}
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                    ))}
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const PieChart = ({
    data,
    index,
    category,
    colors,
    valueFormatter = (value: number) => `${value}`,
    className = ""
}: PieChartProps) => {
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={12}
                fontWeight="medium"
            >
                {`${name} (${valueFormatter(value)})`}
            </text>
        );
    };

    return (
        <div className={`w-full h-full ${className}`}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey={category}
                        nameKey={index}
                    >
                        {data.map((_, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={getColorHex(colors[index % colors.length])}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={valueFormatter}
                        contentStyle={{
                            backgroundColor: 'rgb(255, 255, 255)',
                            borderRadius: '6px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            borderColor: 'rgba(229, 231, 235)'
                        }}
                    />
                    <Legend />
                </RechartsPieChart>
            </ResponsiveContainer>
        </div>
    );
};

// LineChart is also included for additional flexibility
export const LineChart = ({
    data,
    index,
    categories,
    colors,
    valueFormatter = (value: number) => `${value}`,
    className = ""
}: ChartProps) => {
    return (
        <div className={`w-full h-full ${className}`}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                        dataKey={index}
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: 'rgba(107, 114, 128, 0.2)' }}
                        axisLine={{ stroke: 'rgba(107, 114, 128, 0.2)' }}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={valueFormatter}
                        tickLine={{ stroke: 'rgba(107, 114, 128, 0.2)' }}
                        axisLine={{ stroke: 'rgba(107, 114, 128, 0.2)' }}
                    />
                    <Tooltip
                        formatter={valueFormatter}
                        contentStyle={{
                            backgroundColor: 'rgb(255, 255, 255)',
                            borderRadius: '6px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            borderColor: 'rgba(229, 231, 235)'
                        }}
                    />
                    <Legend />
                    {categories.map((category, index) => (
                        <Line
                            key={category}
                            type="monotone"
                            dataKey={category}
                            stroke={getColorHex(colors[index % colors.length])}
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </RechartsLineChart>
            </ResponsiveContainer>
        </div>
    );
};