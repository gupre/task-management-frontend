import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Paper, Divider, Button, Grid, Card, CardContent } from '@mui/material'
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate  } from "react-router-dom";
import { fetchProjectReports } from "../../store/reportProjectSlice";
import { RootState, AppDispatch } from "../../store";

const ReportProjectDetail: React.FC = () => {
	const { projectId, reportId } = useParams<{ projectId: string; reportId: string }>();
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();

	const { projectReports, loading, error } = useSelector((state: RootState) => state.reportProject);
	const [selectedReport, setSelectedReport] = useState<any>(null);

	useEffect(() => {
		if (projectId) {
			dispatch(fetchProjectReports({ projectId: Number(projectId) }));
		}
	}, [dispatch, projectId]);

	useEffect(() => {
		if (projectReports.length > 0) {
			const report = projectReports.find(report => report.reportId === Number(reportId));
			setSelectedReport(report || null);
		}
	}, [projectReports, reportId]);

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
				<Grid container spacing={2}>
					{lines.map((line: string, index: number) => (
						<Grid item xs={12} md={6} key={index}>
							<Card variant="outlined">
								<CardContent>
									<Typography variant="body2">
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
			<Box display="flex" flexDirection="column" gap={2}>
				<Typography variant="body1" sx={{ fontWeight: 500 }}>
					{mainText}
				</Typography>
				{analysis && (
					<Typography variant="body2" color="text.secondary">
						{analysis}
					</Typography>
				)}
			</Box>
		);

		switch (report.type) {
			case "tasks":
				return renderTasks(report.content || "");
			case "efficiency":
			case "general":
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

	return (
		<Box p={4}>
			<Button
				variant="outlined"
				onClick={() => navigate(-1)}
				sx={{ mb: 2 }}
			>
				Назад
			</Button>


			<Paper sx={{ p: 3 }}>
				<Typography variant="h4" gutterBottom>
					Детальный отчёт: {selectedReport.title || "Отчёт"}
				</Typography>

				<Typography variant="subtitle1" color="text.secondary" gutterBottom>
					Тип: {selectedReport.type === "tasks" ? "По задачам" : selectedReport.type === "efficiency" ? "По эффективности" : "Общий"}
				</Typography>

				<Typography variant="caption" color="text.secondary">
					Дата создания: {new Date(selectedReport.generatedDate).toLocaleString()}
				</Typography>

				<Divider sx={{ my: 2 }} />

				{renderMetrics(selectedReport)}
				<Divider sx={{ my: 2 }} />
				{renderReportContent(selectedReport)}

			</Paper>
		</Box>
	);
};

export default ReportProjectDetail;
