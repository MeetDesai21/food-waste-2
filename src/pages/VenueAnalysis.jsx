import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { api } from '../api/mockApi';
import { setLoading, setError } from '../store/slices/foodWasteSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const COLORS = ['#0284c7', '#22c55e', '#ef4444', '#f59e0b', '#6366f1'];

function VenueCard({ name, data }) {
  const metrics = {
    'Total Waste': `${data.totalWaste}kg`,
    'Waste Cost': `₹${data.wasteCost.toLocaleString()}`,
    'Efficiency': `${data.efficiency}%`,
    'Most Wasted': data.mostWastedItem.name,
  };

  return (
    <div className={`card p-4 sm:p-6 ${name === 'Venue A' ? 'border-l-4 border-primary-500' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <BuildingOfficeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-2" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900">{name}</h3>
        </div>
        <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
      </div>
      <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-3 sm:gap-4">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key}>
            <p className="text-xs sm:text-sm text-gray-500">{key}</p>
            <p className="mt-1 text-base sm:text-lg font-semibold text-primary-600">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, unit, icon: Icon }) {
  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-2" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900">{title}</h3>
        </div>
        {trend !== undefined && (
          <span className={`flex items-center text-xs sm:text-sm ${trend >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            {trend >= 0 ? (
              <ArrowTrendingUpIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
            )}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl sm:text-3xl font-bold text-primary-600">
        {value} {unit}
      </p>
    </div>
  );
}

export default function VenueAnalysis() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.foodWaste);
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        dispatch(setLoading(true));
        const data = await api.getWastageAnalytics(dateRange, selectedVenue);
        setAnalyticsData(data);
      } catch (err) {
        dispatch(setError('Failed to fetch venue analysis data'));
      } finally {
        dispatch(setLoading(false));
      }
    }
    fetchData();
  }, [dispatch, dateRange, selectedVenue]);

  if (loading || !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const getDateRangeText = () => {
    switch (dateRange) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      default:
        return 'Today';
    }
  };

  // Transform data for charts
  const wasteByCategory = analyticsData.mostWastedItems.map(item => ({
    name: item.name,
    value: item.amount
  }));

  const dailyTrends = analyticsData.dailyTrends.map(trend => ({
    date: trend.date,
    waste: trend.waste
  }));

  const performanceMetrics = [
    { metric: 'Efficiency', value: analyticsData.efficiency },
    { metric: 'Waste Control', value: 100 - (analyticsData.totalWaste / 100) },
    { metric: 'Cost Management', value: 100 - (analyticsData.wasteCost / 1000) },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Venue Analysis</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Compare performance metrics across different venues for {getDateRangeText()}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 sm:gap-4">
          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
            className="input bg-white w-full sm:w-auto"
          >
            <option value="all">All Venues</option>
            <option value="venue-a">Venue A</option>
            <option value="venue-b">Venue B</option>
            <option value="venue-c">Venue C</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input bg-white w-full sm:w-auto"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <MetricCard
          title="Total Waste"
          value={analyticsData.totalWaste}
          unit="kg"
          icon={BuildingOfficeIcon}
        />
        <MetricCard
          title="Waste Cost"
          value={`₹${analyticsData.wasteCost.toLocaleString()}`}
          icon={BuildingOfficeIcon}
        />
        <MetricCard
          title="Efficiency Rate"
          value={analyticsData.efficiency}
          unit="%"
          icon={BuildingOfficeIcon}
        />
      </div>

      {/* Waste Trends */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Waste Trends</h2>
        <div className="h-60 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="waste" name="Waste (kg)" stroke="#0284c7" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Most Wasted Items */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Most Wasted Items</h2>
          <div className="h-60 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={wasteByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value}kg)`}
                  outerRadius="80%"
                  fill="#8884d8"
                  dataKey="value"
                >
                  {wasteByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Radar */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Performance Metrics</h2>
          <div className="h-60 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceMetrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="#0284c7"
                  fill="#0284c7"
                  fillOpacity={0.6}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
} 