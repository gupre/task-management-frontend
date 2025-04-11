import React from "react";
import { Box, Select, MenuItem, FormControl, InputLabel } from "@mui/material";

interface FilterPanelProps {
    filters: { status: string; priority: string };
    onFilterChange: (filterName: string, value: string) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
    return (
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <FormControl variant="outlined" size="small" sx={{ width: 200 }}>
                <InputLabel>Статус</InputLabel>
                <Select
                    value={filters.status}
                    onChange={(e) => onFilterChange("status", e.target.value)}
                    label="Статус"
                >
                    <MenuItem value="all">Все</MenuItem>
                    <MenuItem value="planned">Запланировано</MenuItem>
                    <MenuItem value="progress">В процессе</MenuItem>
                    <MenuItem value="end">Завершено</MenuItem>
                </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{ width: 200 }}>
                <InputLabel>Приоритет</InputLabel>
                <Select
                    value={filters.priority}
                    onChange={(e) => onFilterChange("priority", e.target.value)}
                    label="Приоритет"
                >
                    <MenuItem value="all">Все</MenuItem>
                    <MenuItem value="urgently">Срочно</MenuItem>
                    <MenuItem value="high">Высокий</MenuItem>
                    <MenuItem value="normal">Средний</MenuItem>
                    <MenuItem value="low">Низкий</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
};
