import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Paper, Divider, Button, Grid, Card, CardContent } from '@mui/material'
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate  } from "react-router-dom";
import { fetchProjectReports, fetchTasksForGantt } from '../../store/reportProjectSlice'
import { RootState, AppDispatch } from "../../store";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import TaskCompletionChart from './TaskCompletionChart'
import GanttChartComponent from './GanttChartComponent'
import { ReportProject } from '../../types'
import { fetchTasks } from '../../store/taskSlice'
import { TaskType } from '@wamra/gantt-task-react'


const ReportProjectDetail: React.FC = () => {
	const { projectId, reportId } = useParams<{ projectId: string; reportId: string }>();
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();

	const { projectReports, tasksForGantt, loading, error } = useSelector((state: RootState) => state.reportProject);
	const [selectedReport, setSelectedReport] = useState< ReportProject | undefined | null>(null);

	const tasks = useSelector((state: RootState) => state.tasks.items);

	useEffect(() => {
		if (projectId) {
			dispatch(fetchTasks(Number(projectId)));
			dispatch(fetchProjectReports({ projectId: Number(projectId) }));
			dispatch(fetchTasksForGantt(Number(projectId)));
		}
	}, [dispatch, projectId]);

	useEffect(() => {
		if (projectReports.length > 0) {
			const report = projectReports.find(report => report.reportId === Number(reportId));
			setSelectedReport(report || null);
			console.log(report)
		}
	}, [projectReports, reportId]);

	const validateTask = tasks.map(task => ({
		id: String(task.taskId),
		name: task.name,
		start: task.assignmentDate ? new Date(task.assignmentDate) : new Date(), // Проверка на undefined
		end: task.dueDate ? new Date(task.dueDate) : new Date(), // Проверка на undefined
		progress:
			task.status === 'end' ? 100 : task.status === 'progress' ? 50 : 0,
		type: 'task' as TaskType,
	}));

	if (loading) {
		return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
	}

	if (error) {
		return <Typography color="error" align="center" mt={4}>Ошибка: {error}</Typography>;
	}

	if (!selectedReport) {
		return <Typography align="center" mt={4}>Отчёт не найден.</Typography>;
	}

	const renderReportContent = (report: any) => {
		if (!report) return null;

		const renderTasks = (content: string) => {
			const lines = content.split('\n').filter(line => line.trim() !== '');
			return (
				<Grid container spacing={3}>
					{lines.map((line: string, index: number) => (
						<Grid item xs={12} md={6} key={index}>
							<Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 3 }}>
								<CardContent>
									<Typography variant="body2" sx={{ color: 'text.primary' }}>
										{line}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
					))}
				</Grid>
			);
		};

		const renderTextBlock = (mainText: string, analysis?: string) => (
			<Box display="flex" flexDirection="column" gap={3} sx={{ mb: 3 }}>
				<Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 3 }}>
					<CardContent>
						<Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
							{mainText}
						</Typography>
						{analysis && (
							<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
								{analysis}
							</Typography>
						)}
					</CardContent>
				</Card>
			</Box>
		);

		// Пример улучшения для блока "general"
		const renderGeneralReport = () => {
			if (report.type !== 'general' || !report.content) return null;

			const extractValue = (label: string) => {
				const match = report.content?.match(new RegExp(`${label}: ([^\\.]+)`));
				return match ? match[1].trim() : 'Нет данных';
			};

			return (
				<Box display="flex" flexDirection="column" gap={3}>
					<Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 3 }}>
						<CardContent>
							<Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
								Общая информация
							</Typography>
							<Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
								Всего задач: {extractValue('Всего задач')}
							</Typography>
							<Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
								Выполнено задач: {extractValue('Выполнено задач')}
							</Typography>
							<Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
								В процессе: {extractValue('В процессе')}
							</Typography>
							<Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
								Просрочено задач: {extractValue('Просрочено задач')}
							</Typography>
							<Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
								Процент выполнения: {extractValue('Процент выполнения')}
							</Typography>
							<Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
								Среднее время выполнения задачи: {extractValue('Среднее время выполнения задачи')}
							</Typography>
							<Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
								Самая быстрая задача: {extractValue('Самая быстрая задача')}
							</Typography>
							<Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
								Самая долгая задача: {extractValue('Самая долгая задача')}
							</Typography>
						</CardContent>
					</Card>
				</Box>
			);
		};


		// Пример улучшения для блока "efficiency"
		const renderEfficiencyReport = () => {
			if (report.type !== 'efficiency' || !report.content) return null;

			const extractValue = (label: string) => {
				const match = report.content.match(new RegExp(`${label}: ([^\\.]+)`));
				return match ? match[1].trim() : 'Нет данных';
			};

			return (
				<Box display="flex" flexDirection="column" gap={3}>
					<Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 3 }}>
						<CardContent>
							<Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
								Эффективность команды
							</Typography>
							<Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
								Процент выполнения задач: {extractValue('Процент выполнения задач')}
							</Typography>
							<Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
								Среднее время выполнения одной задачи: {extractValue('Среднее время выполнения одной задачи')}
							</Typography>
							<Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
								Самая долгая задача: {extractValue('Самая долгая задача')}
							</Typography>
							<Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
								Самая быстрая задача: {extractValue('Самая быстрая задача')}
							</Typography>
						</CardContent>
					</Card>
				</Box>
			);
		};


		// Пример анализа
		const renderPerformanceAnalysis = (analysis: string) => (
			<Box display="flex" flexDirection="column" gap={3}>
				<Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 3 }}>
					<CardContent>
						<Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
							Анализ
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
							{analysis || 'Нет данных'}
						</Typography>
					</CardContent>
				</Card>
			</Box>
		);


		const renderWorkloadTable = () => {
			if (!selectedReport?.content) return <Typography>Нет данных по нагрузке</Typography>;

			const rows = selectedReport.content.split('\n').filter(Boolean);

			return (
				<Box display="flex" flexDirection="column" gap={3}>
					{rows.map((line, index) => (
						<Card key={index} variant="outlined" sx={{ borderRadius: 2, boxShadow: 3 }}>
							<CardContent>
								<Typography>{line}</Typography>
							</CardContent>
						</Card>
					))}
				</Box>
			);
		};

		const renderTeamMemberReport = () => {
			if (!selectedReport?.content) return <Typography>Нет данных по участникам</Typography>;

			const lines = selectedReport.content.split('\n').filter(Boolean);

			return (
				<Box display="flex" flexDirection="column" gap={3}>
					{lines.map((line, index) => (
						<Card key={index} variant="outlined" sx={{ borderRadius: 2, boxShadow: 3 }}>
							<CardContent>
								<Typography>{line}</Typography>
							</CardContent>
						</Card>
					))}
				</Box>
			);
		};

		switch (report.type) {
			case "workload":
				return renderWorkloadTable();
			case "team-member":
				return renderTeamMemberReport();
			case "tasks":
				return renderTasks(report.content || "");
			case 'general':
				return (
					<>
						<Box sx={{ mb: 3 }}>
							{renderGeneralReport()}
						</Box>
						<Box sx={{ mb: 3 }}>
							{renderPerformanceAnalysis(report.performanceAnalysis)}
						</Box>
					</>
				);

			case 'efficiency':
				return (
					<>
						<Box sx={{ mb: 3 }}>
							{renderEfficiencyReport()}
						</Box>
						<Box sx={{ mb: 3 }}>
							{renderPerformanceAnalysis(report.performanceAnalysis)}
						</Box>
					</>
				);

			default:
				return renderTextBlock(report.content, report.performanceAnalysis);
		}
	};

	const renderMetrics = (report: any) => (
		<Grid container spacing={2} mt={2} mb={4}>
			<Grid item xs={6} md={3}>
				<Card variant="outlined">
					<CardContent>
						<Typography variant="subtitle2" color="text.secondary">
							Всего задач
						</Typography>
						<Typography variant="h6">{report.totalTasks ?? "Нет данных"}</Typography>
					</CardContent>
				</Card>
			</Grid>
			<Grid item xs={6} md={3}>
				<Card variant="outlined">
					<CardContent>
						<Typography variant="subtitle2" color="text.secondary">
							Выполнено
						</Typography>
						<Typography variant="h6">{report.completedTasks ?? "Нет данных"}</Typography>
					</CardContent>
				</Card>
			</Grid>
			<Grid item xs={6} md={3}>
				<Card variant="outlined">
					<CardContent>
						<Typography variant="subtitle2" color="text.secondary">
							Процент выполнения
						</Typography>
						<Typography variant="h6">{report.completionRate ?? "Нет данных"}</Typography>
					</CardContent>
				</Card>
			</Grid>
			<Grid item xs={6} md={3}>
				<Card variant="outlined">
					<CardContent>
						<Typography variant="subtitle2" color="text.secondary">
							Среднее время задачи
						</Typography>
						<Typography variant="h6">
							{report.averageTimePerTask !== undefined
								? `${report.averageTimePerTask.toFixed(2)} ч.`
								: "Нет данных"}
						</Typography>
					</CardContent>
				</Card>
			</Grid>
		</Grid>
	);

	const handleDownloadPDF = async () => {
		if (!selectedReport) return;

		const input = document.getElementById('report-content');
		if (!input) return;

		const canvas = await html2canvas(input, { scale: 2 }); // Масштаб для качества
		const imgData = canvas.toDataURL('image/png');

		const pdf = new jsPDF('p', 'mm', 'a4');
		const imgProps = pdf.getImageProperties(imgData);
		const pdfWidth = pdf.internal.pageSize.getWidth();
		const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

		pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
		pdf.save(`Отчет_${selectedReport.title || "проект"}.pdf`);
	};

	return (
		<Box p={4}>
			<Box display="flex" gap={2} mb={2}>
				<Button variant="outlined" onClick={() => navigate(-1)}>
					Назад
				</Button>
				<Button variant="contained" color="primary" onClick={handleDownloadPDF}>
					Скачать PDF
				</Button>
			</Box>

			<Paper id="report-content" sx={{ p: 3 }}>
				<Typography variant="h4" gutterBottom>
					Детальный отчёт: {selectedReport.title || "Отчёт"}
				</Typography>

				<Typography variant="subtitle1" color="text.secondary" gutterBottom>
					Тип: {
					selectedReport.type === "tasks" ? "По задачам"
						: selectedReport.type === "efficiency" ? "По эффективности"
							: selectedReport.type === "team-member" ? "По участникам"
								: selectedReport.type === "workload" ? "По нагрузке"
									: "Общий"
				}
				</Typography>

				<Typography variant="caption" color="text.secondary">
					Дата создания: {new Date(selectedReport.generatedDate).toLocaleString()}
				</Typography>

				<Divider sx={{ my: 2 }} />

				{renderMetrics(selectedReport)}
				<Divider sx={{ my: 2 }} />
				{renderReportContent(selectedReport)}

				<Divider sx={{ my: 2 }} />

				{/* График выполнения задач */}
				{selectedReport.type === "tasks" && (
					<Box mt={4}>
						<Typography variant="h6" gutterBottom>
							График выполнения задач
						</Typography>
						<TaskCompletionChart
							completedTasks={selectedReport.completedTasks}
							totalTasks={selectedReport.totalTasks}
						/>
					</Box>
				)}

				{validateTask.length > 0 && (
					<Box mt={4}>
						<Typography variant="h5" gutterBottom>Диаграмма Ганта</Typography>
						<GanttChartComponent tasks={validateTask} />
					</Box>
				)}

			</Paper>
		</Box>
	);
};

export default ReportProjectDetail;