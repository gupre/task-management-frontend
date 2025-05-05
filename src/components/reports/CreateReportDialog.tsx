import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from "@mui/material";
import React, { useState, useEffect } from "react";

interface CreateReportDialogProps {
	open: boolean;
	onClose: () => void;
	onCreate: (title: string, type: string) => void;
	onEdit: (title: string, type: string) => void;
	initialTitle?: string;
	initialType?: string;
	isEditMode?: boolean;
}

const reportTypes = [
	{ value: "general", label: "Общий" },
	{ value: "tasks", label: "По задачам" },
	{ value: "efficiency", label: "По эффективности команды" },
	{ value: "workload", label: "По нагрузке" },
	{ value: "team-member", label: "По участникам" },
];

const CreateReportDialog: React.FC<CreateReportDialogProps> = ({
																																 open,
																																 onClose,
																																 onCreate,
																																 onEdit,
																																 initialTitle = "",
																																 initialType = "general",
																																 isEditMode = false,
																															 }) => {
	const [title, setTitle] = useState(initialTitle);
	const [type, setType] = useState(initialType);

	useEffect(() => {
		// Если открывается модалка в режиме редактирования, устанавливаем начальные значения
		if (isEditMode) {
			setTitle(initialTitle);
			setType(initialType);
		}
	}, [open, isEditMode, initialTitle, initialType]);

	const handleSubmit = () => {
		if (isEditMode) {
			onEdit(title, type);
		} else {
			onCreate(title, type);
		}
		setTitle("");
		setType("general");
		onClose();
	};

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>{isEditMode ? "Редактирование отчёта" : "Создание отчёта"}</DialogTitle>
			<DialogContent sx={{ pt: 1 }}>
				<TextField
					fullWidth
					label="Название отчёта"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					margin="normal"
				/>
				<TextField
					select
					fullWidth
					label="Тип отчёта"
					value={type}
					onChange={(e) => setType(e.target.value)}
					margin="normal"
				>
					{reportTypes.map((option) => (
						<MenuItem key={option.value} value={option.value}>
							{option.label}
						</MenuItem>
					))}
				</TextField>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Отмена</Button>
				<Button onClick={handleSubmit} variant="contained">
					{isEditMode ? "Сохранить" : "Создать"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CreateReportDialog;
