import React from "react";
import { Pie } from "react-chartjs-2"; // Сменил на Pie-диаграмму для наглядности
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

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
			},
		],
	};

	return <Pie data={data} />;
};

export default TaskCompletionChart;
