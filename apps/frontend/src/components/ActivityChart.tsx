import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { api } from '../api/api';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ActivityChartProps {
  refreshTrigger: number;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ refreshTrigger }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityStats();
  }, [refreshTrigger]);

  const fetchActivityStats = async () => {
    setLoading(true);
    try {
      const stats = await api.getActivityStats(30); // Last 30 days
      
      const labels = stats.map(s => format(new Date(s.date), 'MMM dd'));
      const transfers = stats.map(s => s.transfers);
      const volume = stats.map(s => s.volume);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Number of Transfers',
            data: transfers,
            borderColor: 'rgb(102, 126, 234)',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            yAxisID: 'y',
          },
          {
            label: 'Volume (µPatrons)',
            data: volume,
            borderColor: 'rgb(118, 75, 162)',
            backgroundColor: 'rgba(118, 75, 162, 0.1)',
            yAxisID: 'y1',
          }
        ]
      });
    } catch (err) {
      console.error('Failed to fetch activity stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Activity Over Time (Last 30 Days)'
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Transfers'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Volume (µPatrons)'
        },
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString();
          }
        }
      },
    },
  };

  if (loading || !chartData) {
    return <div className="loading">Loading activity chart...</div>;
  }

  return (
    <div className="activity-chart">
      <Line options={options} data={chartData} />
    </div>
  );
};
