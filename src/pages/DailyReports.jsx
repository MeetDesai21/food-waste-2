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
  ComposedChart,
} from 'recharts';
import {
  CalendarIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';
import { api } from '../api/mockApi';
import { setLoading, setError } from '../store/slices/foodWasteSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

function ReportCard({ title, value, description, icon: Icon, trend, className }) {
  return (
    <div className={`card p-4 sm:p-6 ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-2" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900">{title}</h3>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-bold text-primary-600">{value}</p>
          {description && (
            <p className="mt-1 text-xs sm:text-sm text-gray-500">{description}</p>
          )}
        </div>
        {trend && (
          <span className={`text-xs sm:text-sm ${trend >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

function DatePicker({ value, onChange }) {
  return (
    <div className="relative w-full sm:w-auto">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input bg-white pl-10 w-full"
      />
      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
    </div>
  );
}

export default function DailyReports() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.foodWaste);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState('daily');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        dispatch(setLoading(true));
        const data = await api.getReport(reportType, selectedDate);
        setReportData(data);
      } catch (err) {
        dispatch(setError('Failed to fetch report data'));
      } finally {
        dispatch(setLoading(false));
      }
    }
    fetchData();
  }, [dispatch, reportType, selectedDate]);

  if (loading || !reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const getReportTypeText = () => {
    switch (reportType) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return 'Daily';
    }
  };

  const getTrendData = () => {
    if (reportType === 'daily') {
      return reportData.mealData;
    }
    return reportData.trends;
  };

  const getXAxisKey = () => {
    switch (reportType) {
      case 'daily':
        return 'name';
      case 'weekly':
        return 'day';
      case 'monthly':
        return 'week';
      default:
        return 'name';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{getReportTypeText()} Report</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Comprehensive {reportType} food service and waste reports
          </p>
        </div>

        {/* Report Controls */}
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 sm:gap-4">
          <DatePicker value={selectedDate} onChange={setSelectedDate} />
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="input bg-white w-full sm:w-auto"
          >
            <option value="daily">Daily Report</option>
            <option value="weekly">Weekly Summary</option>
            <option value="monthly">Monthly Analysis</option>
          </select>
          <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
            <button className="btn-primary flex items-center justify-center flex-1 sm:flex-none text-sm">
              <DocumentArrowDownIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Export
            </button>
            <button className="btn-primary flex items-center justify-center flex-1 sm:flex-none text-sm">
              <PrinterIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <ReportCard
          title="Total Meals Served"
          value={reportData.summary.totalServed}
          description={`meals this ${reportType.slice(0, -2)}`}
          icon={ChartPieIcon}
          trend={5}
        />
        <ReportCard
          title="Food Waste"
          value={`${reportData.summary.totalWaste}kg`}
          description={`${((reportData.summary.totalWaste / reportData.summary.totalServed) * 100).toFixed(1)}% of total served`}
          icon={ChartPieIcon}
          trend={-2}
          className="bg-red-50"
        />
        <ReportCard
          title="Cost Saved"
          value={`₹${reportData.summary.costSaved.toLocaleString()}`}
          description="vs. previous period"
          icon={ChartPieIcon}
          trend={-8}
          className="bg-green-50"
        />
        <ReportCard
          title="Efficiency Rate"
          value={`${reportData.summary.efficiency}%`}
          description="food utilization"
          icon={ChartPieIcon}
          trend={2}
          className="bg-blue-50"
        />
      </div>

      {/* Trend Analysis */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
          {reportType === 'daily' ? 'Meal-wise Analysis' : `${getReportTypeText()} Overview`}
        </h2>
        <div className="h-60 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={getTrendData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={getXAxisKey()} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="served" name="Meals Served" fill="#0ea5e9" />
              <Line type="monotone" dataKey="waste" name="Waste" stroke="#ef4444" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Report Table */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Detailed Report</h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meal Type
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meals Served
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waste (kg)
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Efficiency
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost Impact
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.detailedReport.map((row, index) => (
                  <tr key={index}>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {row.mealType}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {row.mealsServed}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {row.waste}
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {row.efficiency}%
                    </td>
                    <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      ₹{row.costImpact.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 