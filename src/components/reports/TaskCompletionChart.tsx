import React from "react";
import { Pie } from "react-chartjs-2"; // Сменил на Pie-диаграмму для наглядности
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Box, Typography } from '@mui/material'

ChartJS.register(ArcElement, Tooltip, Legend);

const TaskCompletionChart = ({ completedTasks = 0, totalTasks = 0 }: { completedTasks?: number; totalTasks?: number }) => {
	const incompleteTasks = Math.max(totalTasks - completedTasks, 0);

	const data = {
		labels: ['Выполнено', 'Не выполнено'],
		datasets: [
			{
				data: [completedTasks, incompleteTasks],
				backgroundColor: ['#4caf50', '#f44336'],
				hoverBackgroundColor: ['#66bb6a', '#e57373'],
				borderWidth: 1,
			},
		],
	};

	const options = {
		responsive: true,
		plugins: {
			legend: {
				position: 'bottom' as const,
				labels: {
					boxWidth: 12,
					padding: 10,
					font: {
						size: 14,
						weight: 600,
					},
				},
			},
		},
	};

	return (
	<Box display="flex" flexDirection="column" alignItems="center" sx={{ mt: 2 }}>
		<Box width={400} height={400}>
			<Pie data={data} options={options} />
		</Box>
	</Box>
	)
};

export default TaskCompletionChart;
