import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNotifications, markAsRead } from '../store/notificationsSlice'
import { AppDispatch, RootState } from '../store'
import {
	Card,
	CardContent,
	Typography,
	Button,
	Box,
	Divider,
	Stack,
} from '@mui/material'
import dayjs from 'dayjs'

export const NotificationsPage = () => {
	const dispatch = useDispatch<AppDispatch>()
	const notifications = useSelector((state: RootState) => state.notifications.items)

	useEffect(() => {
		dispatch(fetchNotifications())
	}, [dispatch])

	const handleMarkAsRead = (id: number) => {
		dispatch(markAsRead(id))
	}

	return (
		<div className="p-6 max-w-3xl mx-auto space-y-4">
			<Typography variant="h4" className="mb-4 font-semibold">
				Уведомления
			</Typography>
			{notifications.length === 0 ? (
				<Typography variant="body1" className="text-gray-500">
					Уведомлений нет.
				</Typography>
			) : (
				notifications.map((n) => (
					<Card
						key={n.id}
						className={`transition-shadow ${
							n.isRead ? 'opacity-70' : 'shadow-lg'
						}`}
					>
						<CardContent>
							<Stack direction="row" justifyContent="space-between" alignItems="flex-start">
								<Box>
									<Typography variant="subtitle1" fontWeight={600}>
										{n.subject}
									</Typography>
									<Typography variant="body2" className="text-gray-700 mt-1">
										{n.message}
									</Typography>
									<Typography variant="caption" className="text-gray-500 mt-2 block">
										{dayjs(n.createdAt).format('DD.MM.YYYY HH:mm')}
									</Typography>
								</Box>
								{!n.isRead && (
									<Button
										variant="outlined"
										size="small"
										onClick={() => handleMarkAsRead(n.id)}
										className="ml-4"
									>
										Прочитано
									</Button>
								)}
							</Stack>
						</CardContent>
					</Card>
				))
			)}
		</div>
	)
}
