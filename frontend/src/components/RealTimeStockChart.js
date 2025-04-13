import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const RealTimeStockChart = ({ symbol = "AAPL" }) => {
  const mockData = {
    labels: ["10:00", "10:05", "10:10", "10:15", "10:20"],
    datasets: [
      {
        label: `${symbol} Price`,
        data: [183, 184, 185, 184.5, 186],
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.4,
      },
    ],
  };

  return (
    <div>
      <Line data={mockData} />
    </div>
  );
};

export default RealTimeStockChart;
