import React, { useEffect, useState } from "react";
import {
	Button,
	Box,
	Typography,
	CircularProgress,
	Paper,
	List,
	ListItem,
	Divider,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	IconButton,
	InputAdornment
} from '@mui/material'
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from 'react-router-dom'
import { fetchProjectReports, createProjectReport, updateProjectReport, deleteProjectReport } from "../store/reportProjectSlice";
import { RootState, AppDispatch } from "../store";
import CreateReportDialog from "../components/reports/CreateReportDialog";
import { Edit, Delete } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search'

const ProjectReportPage: React.FC = () => {
	const { projectId } = useParams<{ projectId: string }>();
	const dispatch = useDispatch<AppDispatch>();

	const { projectReports, loading, error } = useSelector((state: RootState) => state.reportProject);

	const [openDialog, setOpenDialog] = useState(false);
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [editingReport, setEditingReport] = useState<any>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState<string>("");
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");

	useEffect(() => {
		if (projectId) {
			dispatch(fetchProjectReports({ projectId: Number(projectId), startDate, endDate }));
		}
	}, [dispatch, projectId, startDate, endDate]);

	const handleCreateReport = (title: string, type: string) => {
		if (projectId && title) {
			dispatch(createProjectReport({
				projectId: Number(projectId),
				title,
				type
			}));
		}
	};

	const handleUpdateReport = (title: string, type: string) => {
		if (editingReport) {
			dispatch(updateProjectReport({
				...editingReport,
				title,
				type
			}));
		}
		setEditingReport(null);
		setOpenEditDialog(false);
	};

	const handleDeleteReport = (reportId: number) => {
		if (window.confirm("Вы уверены, что хотите удалить отчёт?")) {
			dispatch(deleteProjectReport(reportId));
		}
	};

	if (loading) {
		return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
	}

	if (error) {
		return <Typography color="error" align="center" mt={4}>Ошибка: {error}</Typography>;
	}

	const filteredReports = projectReports.filter(r => r.projectId === Number(projectId));

	const filteredByDateReports = filteredReports.filter(report => {
		const reportDate = new Date(report.generatedDate);
		const start = startDate ? new Date(startDate) : new Date(0); // Если не задана дата начала, используем 1970 год
		const end = endDate ? new Date(endDate) : new Date(); // Если не задана дата конца, используем сегодняшнюю дату
		return reportDate >= start && reportDate <= end;
	});

	const searchedReports = filteredByDateReports.filter(report =>
		(report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			report.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			report.performanceAnalysis?.toLowerCase().includes(searchTerm.toLowerCase())) &&
		(filterType ? report.type === filterType : true)
	);

	const sortedReports = searchedReports.sort((a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime());

	return (
		<Box p={4}>
			<Typography variant="h4" sx={{ mr: 2, mb: 4, flexShrink: 0 }}>
				Отчёты по проекту {filteredReports[0]?.project?.name || `${projectId}`}
			</Typography>

			<Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" mb={2}>

				<Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
					<TextField
						size="small"
						placeholder="Поиск"
						variant="outlined"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon />
								</InputAdornment>
							),
						}}
					/>

					<FormControl size="small" sx={{ minWidth: 150 }}>
						<InputLabel id="filter-type-label">Тип отчёта</InputLabel>
						<Select
							labelId="filter-type-label"
							value={filterType}
							label="Тип отчёта"
							onChange={(e) => setFilterType(e.target.value)}
						>
							<MenuItem value="">Все</MenuItem>
							<MenuItem value="tasks">По задачам</MenuItem>
							<MenuItem value="efficiency">По эффективности</MenuItem>
							<MenuItem value="general">Общий</MenuItem>
							<MenuItem value="workload">По нагрузке</MenuItem>
							<MenuItem value="team-member">По участникам</MenuItem>
						</Select>
					</FormControl>

					<TextField
						size="small"
						label="Дата начала"
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						InputLabelProps={{ shrink: true }}
					/>

					<TextField
						size="small"
						label="Дата окончания"
						type="date"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						InputLabelProps={{ shrink: true }}
					/>

					<Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
						Создать отчёт
					</Button>
				</Box>
			</Box>

			{searchedReports.length === 0 ? (
				<Typography>Нет отчётов для этого проекта.</Typography>
			) : (
				<List>
					{sortedReports.map((report) => (
						<Paper key={report.reportId} sx={{ mb: 2, p: 2 }}>
							<ListItem alignItems="flex-start" disableGutters>
								<Box width="100%">
									<Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
										<Link to={`/project/${projectId}/report/${report.reportId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
											{report.title || "Отчёт"}
										</Link>
										<Box>
											<IconButton size="small" onClick={() => { setEditingReport(report); setOpenEditDialog(true); }}>
												<Edit fontSize="small" />
											</IconButton>
											<IconButton size="small" onClick={() => handleDeleteReport(report.reportId)}>
												<Delete fontSize="small" />
											</IconButton>
										</Box>
									</Box>

									<Typography variant="body2" color="text.secondary">
										Тип: {
										report.type === "tasks"
											? "По задачам"
											: report.type === "efficiency"
												? "По эффективности"
												: report.type === "general"
													? "Общий"
													: report.type === "workload"
														? "По нагрузке"
														: report.type === "team-member"
															? "По участникам"
															: report.type
									}
									</Typography>

									<Divider sx={{ my: 1 }} />

									<Typography variant="caption" color="text.secondary">
										Дата создания: {new Date(report.generatedDate).toLocaleString()}
									</Typography>
								</Box>
							</ListItem>
						</Paper>
					))}
				</List>
			)}

			{/* Диалоги */}
			<CreateReportDialog
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				onCreate={handleCreateReport}
				onEdit={() => {}}
			/>

			<CreateReportDialog
				open={openEditDialog}
				onClose={() => { setOpenEditDialog(false); setEditingReport(null); }}
				onEdit={handleUpdateReport}
				onCreate={() => {}}
				initialTitle={editingReport?.title}
				initialType={editingReport?.type}
				isEditMode={true}
			/>
		</Box>
	);
};

export default ProjectReportPage;
