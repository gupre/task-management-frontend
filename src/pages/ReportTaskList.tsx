export {}

// import React, { useEffect, useState } from "react";
// import {
// 	Button, Box, Typography, CircularProgress, Paper, List, ListItem, Divider, TextField
// } from '@mui/material';
// import { useDispatch, useSelector } from "react-redux";
// import { useParams } from "react-router-dom";
// import { createTaskReport, fetchReportsByTaskId } from '../store/reportTaskSlice'
// import { RootState, AppDispatch } from "../store";
// import CreateReportDialog from "../components/reports/CreateReportDialog";
//
//
// export const ReportTaskList: React.FC = () => {
// 	const { taskId } = useParams<{ taskId: string }>();
// 	const dispatch = useDispatch<AppDispatch>();
//
// 	const { taskReports, loading, error } = useSelector((state: RootState) => state.reportTask);
//
// 	const [openDialog, setOpenDialog] = useState(false);
// 	const [searchTerm, setSearchTerm] = useState("");
//
// 	useEffect(() => {
// 		if (taskId) {
// 			dispatch(fetchReportsByTaskId(Number(taskId)));
// 		}
// 	}, [dispatch, taskId]);
//
// 	const handleCreateReport = (title: string, type: string) => {
// 		if (taskId && title) {
// 			// dispatch(createTaskReport({
// 			// 	taskId: Number(taskId),
// 			// 	title,
// 			// 	type
// 			// }));
// 		}
// 	};
//
//
// 	if (loading) {
// 		return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
// 	}
//
// 	if (error) {
// 		return <Typography color="error" align="center" mt={4}>Ошибка: {error}</Typography>;
// 	}
//
// 	const filteredReports = taskReports.filter(r => r.taskId === Number(taskId));
//
// 	const searchedReports = filteredReports.filter(report =>
// 		report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// 		report.content?.toLowerCase().includes(searchTerm.toLowerCase())
// 	);
//
// 	return (
// 		<Box p={4}>
// 			<Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" mb={2}>
// 				<Typography variant="h4" sx={{ mr: 2, flexShrink: 0 }}>
// 					Отчёты по задаче {filteredReports[0]?.task?.name || `#${taskId}`}
// 				</Typography>
//
// 				<Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
// 					<TextField
// 						size="small"
// 						label="Поиск"
// 						variant="outlined"
// 						value={searchTerm}
// 						onChange={(e) => setSearchTerm(e.target.value)}
// 					/>
//
// 					<Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
// 						Создать отчёт
// 					</Button>
// 				</Box>
// 			</Box>
//
// 			{searchedReports.length === 0 ? (
// 				<Typography>Нет отчётов для этой задачи.</Typography>
// 			) : (
// 				<List>
// 					{searchedReports.map((report) => (
// 						<Paper key={report.reportId} sx={{ mb: 2, p: 2 }}>
// 							<ListItem alignItems="flex-start" disableGutters>
// 								<Box width="100%">
// 									<Typography variant="h6" gutterBottom>
// 										{report.title || "Отчёт"}
// 									</Typography>
//
// 									<Box>
// 										<Typography variant="body2">{report.content}</Typography>
// 									</Box>
//
// 									<Divider sx={{ my: 1 }} />
//
// 									<Typography variant="caption" color="text.secondary">
// 										Дата создания: {new Date(report.generatedDate).toLocaleString()}
// 									</Typography>
// 								</Box>
// 							</ListItem>
// 						</Paper>
// 					))}
// 				</List>
// 			)}
//
// 			{/*<CreateReportDialog*/}
// 			{/*	open={openDialog}*/}
// 			{/*	onClose={() => setOpenDialog(false)}*/}
// 			{/*	onCreate={handleCreateReport}*/}
// 			{/*/>*/}
// 		</Box>
// 	);
// };
