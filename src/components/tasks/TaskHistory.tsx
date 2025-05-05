import React, { useEffect, useRef, useState } from 'react'
import { fetchTaskHistory } from '../../store/historySlice'
import { Box, Typography, TextField, Button } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import { getToken } from '../../utils/auth'
import dayjs from 'dayjs';

interface TaskHistoryProps {
	taskId: number | undefined;
}

const TaskHistory: React.FC<TaskHistoryProps> = ({ taskId }) => {
	const dispatch = useDispatch<AppDispatch>();
	const email = useSelector((state: RootState) => state.auth.user?.email);


	const token = useSelector(getToken);
	const historys = useSelector((state: RootState) => state.history.items);

	const [newComment, setNewComment] = useState("");

	const historyEndRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (taskId) {
			dispatch(fetchTaskHistory(taskId));
		}
	}, [taskId, dispatch]);

	useEffect(() => {
		scrollToBottom();
	}, [historys]);

	const handleAddComment = async () => {
		if (!newComment.trim() || !taskId) return;

		try {
			const userResponse = await fetch(`http://localhost:4200/api/users/email/${email}`, {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${token}`,
				},
			});

			if (!userResponse.ok) {
				throw new Error(`Ошибка получения пользователя: ${userResponse.status}`);
			}

			const userData = await userResponse.json();
			const userId = userData.userId;

			if (!userId) {
				throw new Error("Не найден userId для текущего пользователя");
			}

			const response = await fetch(`http://localhost:4200/api/history/user/${userId}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`,
				},
				body: JSON.stringify({
					taskId,
					comment: newComment,
				}),
			});

			if (!response.ok) {
				throw new Error(`Ошибка ${response.status}`);
			}

			setNewComment("");
			dispatch(fetchTaskHistory(taskId));
		} catch (error) {
			console.error("Ошибка при добавлении комментария:", error);
		}
	};

	const scrollToBottom = () => {
		if (historyEndRef.current) {
			historyEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleAddComment();
		}
	};

	return (
		<Box display="flex" flexDirection="column" height="100%">
			<Typography variant="h6" textAlign="center" mb={2}>История изменений</Typography>
			<Box flexGrow={1} overflow="auto" maxHeight="780px" p={1} border={1} borderRadius={2}>
				{historys.length === 0 ? (
					<Typography>Нет записей истории</Typography>
				) : (
					historys.map((item: any) => (
						<Box key={item.historyId} mt={1} p={1} border={1} borderRadius={2}>
							<Typography variant="body2">{item.comment}</Typography>
							<Typography variant="caption" color="textSecondary">
								{item.createdByUser?.name ? `Создано пользователем: ${item.createdByUser.name}` : ""}
								{item.createdByDepartment?.name ? ` | Департамент: ${item.createdByDepartment.name}` : ""}
								{item.createdAt ? ` | Дата: ${dayjs(item.createdAt).format('DD.MM.YYYY HH:mm')}` : ''}
							</Typography>
						</Box>
					))
				)}
				<div ref={historyEndRef} />
			</Box>

			{/* Блок добавления нового комментария */}
			<Box mt={2} display="flex" gap={1}>
				<TextField
					size="small"
					variant="outlined"
					fullWidth
					placeholder="Написать комментарий..."
					value={newComment}
					onChange={(e) => setNewComment(e.target.value)}
					onKeyDown={handleKeyDown}
					multiline
					minRows={1}
					maxRows={4}
				/>
				<Button variant="contained" onClick={handleAddComment}>Отправить</Button>
			</Box>
		</Box>
	);
};

export default TaskHistory;
