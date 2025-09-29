// Типы для пользователей
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles: Role[];
    permissions: Permission[];
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    permissions?: Permission[];
}

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

// Типы для форм
export interface CreateUserForm {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    roles: string[];
}

export interface UpdateUserForm {
    name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
    roles?: string[];
}

export interface CreateRoleForm {
    name: string;
    permissions: string[];
}

export interface UpdateRoleForm {
    name?: string;
    permissions?: string[];
}

// Типы для API ответов
export interface UsersResponse {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface RolesResponse {
    data: Role[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface PermissionsResponse {
    data: Permission[];
}

// Типы для фильтров
export interface UserFilters {
    search?: string;
    role?: string;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
}

export interface RoleFilters {
    search?: string;
    per_page?: number;
    page?: number;
}
