import React from 'react'
import { Column, ColumnProps, Gantt, Task, TaskOrEmpty, ViewMode } from '@wamra/gantt-task-react'
import "@wamra/gantt-task-react/dist/style.css";
import ru from "date-fns/locale/ru";
import "dayjs/locale/ru";

interface GanttChartComponentProps {
	tasks: Task[];
}

const isTask = (task: TaskOrEmpty): task is Task => {
	return (
		"start" in task &&
		"end" in task &&
		"progress" in task &&
		typeof task.start === "object" &&
		typeof task.end === "object"
	);
};

const GanttChartComponent: React.FC<GanttChartComponentProps> = ({ tasks }) => {
	const onDateChange = (task: TaskOrEmpty, children: readonly Task[]): Task => {
		if (isTask(task)) {
			console.log("Изменена дата:", task);
			return task;
		}
		throw new Error("Получен пустой task в onDateChange");
	};

	const columns: Column[] = [
		{
			id: "name",
			title: "Название задачи", // <-- перевод
			width: 200,
			Cell: ({ data }: ColumnProps) => <div>{data.task.name}</div>,
		},
		{
			id: "start",
			title: "Начало",
			width: 120,
			Cell: ({ data }: ColumnProps) => (
				<div>
					{"start" in data.task && data.task.start instanceof Date
						? data.task.start.toLocaleDateString("ru-RU")
						: ""}
				</div>
			),
		},
		{
			id: "end",
			title: "Окончание",
			width: 120,
			Cell: ({ data }: ColumnProps) => (
				<div>
					{
				"end" in data.task && data.task.end instanceof Date
					? data.task.end.toLocaleDateString("ru-RU")
					: ""}
				</div>
			),
		},
	];


	const onProgressChange = (task: TaskOrEmpty): Task => {
		if (isTask(task)) {
			console.log("Прогресс изменён:", task);
			return task;
		}
		throw new Error("Получен пустой task в onProgressChange");
	};

	const onTaskDelete = (task: TaskOrEmpty): boolean => {
		if (isTask(task)) {
			console.log("Удалена задача:", task);
			return true;
		}
		return false;
	};

	const onClick = (task: TaskOrEmpty) => {
		if (isTask(task)) {
			console.log("Задача нажата:", task);
		} else {
			console.log("Клик по пустой области диаграммы");
		}
	};

	const onDoubleClick = (task: TaskOrEmpty) => {
		if (isTask(task)) {
			alert(`Двойной клик по задаче: ${task.name}`);
		}
	};

	function getWeekNumber(date: Date): number {
		const tempDate = new Date(date.getTime());
		tempDate.setHours(0, 0, 0, 0);
		tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));
		const yearStart = new Date(tempDate.getFullYear(), 0, 1);
		const weekNo = Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
		return weekNo;
	}


	return (
		<div style={{ width: "100%", height: "600px" }}>
			<Gantt
				tasks={tasks}
				viewMode={ViewMode.Week}
				onDateChange={onDateChange}
				onProgressChange={onProgressChange}
				// onDelete={onTaskDelete}
				onDoubleClick={onDoubleClick}
				onClick={onClick}
				dateLocale={ru}
				columns={columns}
				renderBottomHeader={(date, viewMode, dateSetup, index, isUnknownDates) => {
					if (viewMode === ViewMode.Week) {
						// Вычисляем номер недели
						const weekNumber = getWeekNumber(date);
						return `Н${weekNumber}`;
					}
					return null;
				}}
			/>
		</div>
	);
};

export default GanttChartComponent;