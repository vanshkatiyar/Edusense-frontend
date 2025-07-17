import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FaRegBuilding, FaUsers, FaUserSlash, FaPowerOff } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function StatCard({ icon, title, value, color }) {
  const IconComponent = icon;
  return (
    <div className="stat-card" style={{ '--accent-color': color }}>
      <div className="stat-icon">
        <IconComponent />
      </div>
      <div className="stat-info">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/analytics')
      .then(res => res.ok ? res.json() : Promise.reject('Network response was not ok'))
      .then(data => setAnalyticsData(data))
      .catch(err => setError('Failed to fetch analytics data.'));
  }, []);

  if (error) return <div className="error-message">{error}</div>;
  if (!analyticsData) return <div>Loading analytics...</div>;

  const { live_stats, branch_usage } = analyticsData;
  const chartData = {
    labels: branch_usage.labels,
    datasets: [{
      label: 'Branch-Wise Classroom Usage (%)',
      data: branch_usage.data,
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
      borderRadius: 5,
    }]
  };

  const stats = [
    { icon: FaRegBuilding, title: "Total Rooms", value: live_stats.total_rooms, color: "#3B82F6" },
    { icon: FaUsers, title: "Occupied Rooms", value: live_stats.occupied_rooms, color: "#10B981" },
    { icon: FaUserSlash, title: "Vacant Rooms", value: live_stats.vacant_rooms, color: "#F59E0B" },
    { icon: FaPowerOff, title: "Wasting Power", value: live_stats.wasting_power_rooms, color: "#EF4444" }
  ];

  return (
    <div className="analytics-page page-content">
      <h2 className="page-title">Campus Analytics</h2>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={stat.title} style={{ animationDelay: `${index * 100}ms` }}>
            <StatCard {...stat} />
          </div>
        ))}
      </div>
      <div className="chart-container">
        <h3>Branch-Wise Usage Summary</h3>
        <Bar data={chartData} options={{ maintainAspectRatio: false }} />
      </div>
    </div>
  );
}