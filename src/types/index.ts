
    export interface Task {
        taskId?: number;
        name: string;
        description: string;
        status: "planned" | "progress" | "end";
        priority: "urgently" | "high" | "normal" | "low";
        assignmentDate?: string;
        hoursSpent?: number;
        dueDate?: string;
        estimatedHours?: number;
        projectId: number;
        userId?: number;
        departmentId?: number;
        // project: Project;
        user?: User;
        // department?: Department;
        history: History[];
        reports: ReportTask[];

    }


export interface Project {
    projectId?: number;
    name: string;
    description: string;
    startDate: string;
    endDate?: string;
    status: "planned" | "progress" | "end";
    // users: ProjectUser[];
    // tasks: Task[];
    // reports: ReportProject[];
}

export interface User {
    userId: number;
    name: string;
    email: string;
    password?: string;
    timezoneId?: number;
    departmentId?: number;
    tasksIds?: number[];
    projectsIds?: number[];
    roleId?: number;
    isActive?: boolean;
    isAdmin?: boolean;

    // timezone: TimeZone;
    // department: Department;
    // role?: Role;
    // tasks: Task[];
    // history: History[];
    // projects: ProjectUser[];
}

export interface Timezone {
    id: number;
    name: string;
    offset: number;

    // users: User[];
}


interface ProjectUser {
    userId: number;
    projectId: number;
    user: User;
    project: Project;
}

// Interface for Department model
export interface Department {
    departmentId: number;
    name: string;
    users: User[];
    history: History[];
    tasks: Task[];
}

// Interface for Role model
export interface Role {
    roleId: number;
    name: string;
    users: User[];
    permissions: RolePermissions[];
}

// Interface for RolePermissions model
export interface RolePermissions {
    roleId: number;
    role: Role;
    permissionsId: number;
    permission: Permissions;
}

// Interface for Permissions model
export interface Permissions {
    permissionsId: number;
    name: string;
    roles: RolePermissions[];
}

// Interface for History model (tracks history of tasks and user actions)
export interface History {
    historyId: number;
    taskId: number;
    task: Task;
    userId?: number;
    user?: User;
    departmentId?: number;
    department?: Department;
    comment?: string;
}

// Interface for ReportTask model (task-specific report)
export interface ReportTask {
    reportId: number;
    taskId: number;
    task: Task;
    reportProjectId: number;
    reportProject: ReportProject;
    generatedDate: string;
    content?: string;
    performanceAnalysis?: string;
}

// Interface for ReportProject model (project-specific report)
export interface ReportProject {
    reportId: number;
    projectId: number;
    project: Project;
    generatedDate: string;
    content?: string;
    performanceAnalysis?: string;
    completedTasks?: number;
    averageTimePerTask?: number;
    completionRate?: string;
    teamEfficiency?: string;
    totalTasks?: number;
    reports: ReportTask[];
}