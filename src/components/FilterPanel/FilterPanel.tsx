import React from "react";
import {
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";

interface FilterPanelProps {
    filters: { executorId?: string; priority: string };
    onFilterChange: (filterName: string, value: string) => void;
    executorOptions?: { id: string; name: string }[];
}

const priorityOptions: Record<string, string> = {
    urgently: "Срочно",
    high: "Высокий",
    normal: "Средний",
    low: "Низкий",
};

export const FilterPanel: React.FC<FilterPanelProps> = ({
                                                            filters,
                                                            onFilterChange,
                                                            executorOptions = [],
                                                        }) => {
    return (
      <Box
        sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mb: 3,
            alignItems: "center",
        }}
      >
          {/* Фильтр по приоритету */}
          <FormControl variant="outlined" size="small" sx={{ width: 200 }}>
              <InputLabel>Приоритет</InputLabel>
              <Select
                value={filters.priority || "all"}
                onChange={(e) =>
                  onFilterChange("priority", e.target.value)
                }
                label="Приоритет"
              >
                  <MenuItem value="all">Все</MenuItem>
                  {Object.entries(priorityOptions).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                        {label}
                    </MenuItem>
                  ))}
              </Select>
          </FormControl>

          {/* Фильтр по исполнителю */}
          <FormControl variant="outlined" size="small" sx={{ width: 200 }}>
              <InputLabel>Исполнитель</InputLabel>
              <Select
                value={filters.executorId || "all"}
                onChange={(e) =>
                  onFilterChange("executorId", e.target.value)
                }
                label="Исполнитель"
              >
                  <MenuItem value="all">Все</MenuItem>
                  {executorOptions.map((executor) => (
                    <MenuItem key={executor.id} value={executor.id}>
                        {executor.name}
                    </MenuItem>
                  ))}
              </Select>
          </FormControl>
      </Box>
    );
};
