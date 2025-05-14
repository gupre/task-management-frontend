import NotificationsIcon from '@mui/icons-material/Notifications'
import Badge from '@mui/material/Badge'
import IconButton from '@mui/material/IconButton'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { useNavigate } from 'react-router-dom'

export const NotificationBell = () => {
	const navigate = useNavigate()
	const unreadCount = useSelector((state: RootState) =>
		state.notifications.items.filter(n => !n.isRead).length
	)

	return (
		<IconButton onClick={() => navigate('/notifications')}>
			<Badge badgeContent={unreadCount} color="error">
				<NotificationsIcon />
			</Badge>
		</IconButton>
	)
}
