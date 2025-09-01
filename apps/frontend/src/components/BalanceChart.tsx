import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { User } from '../types';
import { api } from '../api/api';
import { formatMicropatrons } from '../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BalanceChartProps {
  refreshTrigger: number;
}

export const BalanceChart: React.FC<BalanceChartProps> = ({ refreshTrigger }) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopUsers();
  }, [refreshTrigger]);

  const fetchTopUsers = async () => {
    setLoading(true);
    try {
      const users = await api.getUsers();
      // Sort by balance descending and take top 10
      const topUsers = users.sort((a, b) => b.balance - a.balance).slice(0, 10);
      
      const labels = topUsers.map(u => u.username);
      const balances = topUsers.map(u => u.balance);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Balance (µPatrons)',
            data: balances,
            backgroundColor: [
              'rgba(255, 215, 0, 0.6)',    // Gold for 1st
              'rgba(192, 192, 192, 0.6)',  // Silver for 2nd
              'rgba(205, 127, 50, 0.6)',   // Bronze for 3rd
              'rgba(102, 126, 234, 0.6)',  // Purple for the rest
              'rgba(102, 126, 234, 0.6)',
              'rgba(102, 126, 234, 0.6)',
              'rgba(102, 126, 234, 0.6)',
              'rgba(102, 126, 234, 0.6)',
              'rgba(102, 126, 234, 0.6)',
              'rgba(102, 126, 234, 0.6)',
            ],
            borderColor: [
              'rgba(255, 215, 0, 1)',
              'rgba(192, 192, 192, 1)',
              'rgba(205, 127, 50, 1)',
              'rgba(102, 126, 234, 1)',
              'rgba(102, 126, 234, 1)',
              'rgba(102, 126, 234, 1)',
              'rgba(102, 126, 234, 1)',
              'rgba(102, 126, 234, 1)',
              'rgba(102, 126, 234, 1)',
              'rgba(102, 126, 234, 1)',
            ],
            borderWidth: 2,
          }
        ]
      });
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return formatMicropatrons(context.parsed.y);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Balance (µPatrons)'
        },
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString();
          }
        }
      }
    }
  };

  if (loading || !chartData) {
    return (
      <div className="bg-surface rounded-3xl p-6 h-full flex items-center justify-center">
        <div className="body-base-normal text-secondary">Loading balance chart...</div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-3xl p-6 h-full">
      <h3 className="title-base-semibold text-emphasis mb-4">Top 10 Balances</h3>
      <div className="h-[300px]">
        <Bar options={options} data={chartData} />
      </div>
    </div>
  );
};
