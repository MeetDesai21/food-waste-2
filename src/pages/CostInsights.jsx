import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { api } from '../api/mockApi';
import { setLoading, setError, setCostData } from '../store/slices/costInsightsSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const COLORS = ['#0284c7', '#22c55e', '#ef4444', '#f59e0b', '#6366f1'];

function CostMetricCard({ title, amount, trend, period }) {
  const isPositive = trend >= 0;
  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <CurrencyRupeeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-2" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900">{title}</h3>
        </div>
        <span className={`flex items-center text-xs sm:text-sm ${isPositive ? 'text-red-600' : 'text-green-600'}`}>
          {isPositive ? (
            <ArrowTrendingUpIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
          ) : (
            <ArrowTrendingDownIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
          )}
          {Math.abs(trend)}%
        </span>
      </div>
      <p className="mt-2 text-2xl sm:text-3xl font-bold text-primary-600">₹{amount.toLocaleString()}</p>
      <p className="mt-1 text-xs sm:text-sm text-gray-500">vs last {period}</p>
    </div>
  );
}

function SavingsOpportunityCard({ title, amount, description, priority }) {
  const priorityColors = {
    high: 'text-red-600 bg-red-50',
    medium: 'text-yellow-600 bg-yellow-50',
    low: 'text-green-600 bg-green-50',
  };

  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-2" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900">{title}</h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[priority]}`}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
        </span>
      </div>
      <p className="mt-2 text-xl sm:text-2xl font-bold text-primary-600">₹{amount.toLocaleString()}</p>
      <p className="mt-1 text-xs sm:text-sm text-gray-600">{description}</p>
    </div>
  );
}

export default function CostInsights() {
  const dispatch = useDispatch();
  const {
    loading,
    error,
    costMetrics,
    monthlyCosts,
    costBreakdown,
    savingsOpportunities,
    costAlerts,
  } = useSelector((state) => state.costInsights);
  const [dateRange, setDateRange] = useState('today');
  const [costCategory, setCostCategory] = useState('all');   

  useEffect(() => {
    async function fetchData() {
      try {
        dispatch(setLoading(true));
        const data = await api.getCostInsights(dateRange, costCategory);
        dispatch(setCostData(data));
      } catch (err) {
        dispatch(setError('Failed to fetch cost insights data'));
      } finally {
        dispatch(setLoading(false));
      }
    }
    fetchData();
  }, [dispatch, dateRange, costCategory]);

  if (loading) {
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

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Cost Insights</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Track and analyze your operational costs for {getDateRangeText()}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 sm:gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input bg-white w-full sm:w-auto"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <select
            value={costCategory}
            onChange={(e) => setCostCategory(e.target.value)}
            className="input bg-white w-full sm:w-auto"
          >
            <option value="all">All Categories</option>
            <option value="food">Food Costs</option>
            <option value="labor">Labor Costs</option>
            <option value="overhead">Overhead</option>
          </select>
        </div>
      </div>

      {/* Cost Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {costMetrics.map((metric) => (
          <CostMetricCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Cost Trends */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Cost Trends</h2>
        <div className="h-60 sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyCosts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area
                type="monotone"
                dataKey="food"
                stackId="1"
                stroke="#0284c7"
                fill="#0284c7"
                fillOpacity={0.6}
                name="Food Cost"
              />
              <Area
                type="monotone"
                dataKey="labor"
                stackId="1"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.6}
                name="Labor Cost"
              />
              <Area
                type="monotone"
                dataKey="overhead"
                stackId="1"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.6}
                name="Overhead"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Cost Breakdown */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Cost Breakdown</h2>
          <div className="h-60 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius="80%"
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Savings Opportunities */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-base sm:text-lg font-medium text-gray-900">Savings Opportunities</h2>
          {savingsOpportunities.map((opportunity) => (
            <SavingsOpportunityCard key={opportunity.title} {...opportunity} />
          ))}
        </div>
      </div>

      {/* Cost Alerts */}
      <div className="card bg-yellow-50">
        <div className="flex items-center gap-2 mb-4">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
          <h2 className="text-lg font-medium text-gray-900">Cost Alerts</h2>
        </div>
        <div className="space-y-4">
          {costAlerts.map((alert, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`w-2 h-2 mt-2 rounded-full ${
                alert.severity === 'high' ? 'bg-red-500' :
                alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <div>
                <p className="text-sm text-gray-600">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 