import { apiClient } from '@/lib/api';
import {
    Permission,
    Role,
    RoleFilters,
    RolesResponse,
    User,
    UserFilters,
    UsersResponse,
} from '@/types/user';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Типы для состояния
export interface UsersState {
    users: User[];
    roles: Role[];
    permissions: Permission[];
    currentUser: User | null;
    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    error: string | null;
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

// Начальное состояние
const initialState: UsersState = {
    users: [],
    roles: [],
    permissions: [],
    currentUser: null,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,
    pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
    },
};

// Async thunks
export const fetchUsers = createAsyncThunk(
    'users/fetchUsers',
    async (filters: UserFilters = {}, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, value.toString());
                }
            });

            const response = await apiClient.get<UsersResponse>(
                `/users?${params.toString()}`,
            );
            return response.data;
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error && 'response' in error
                    ? (error as { response?: { data?: { message?: string } } })
                          .response?.data?.message ||
                      'Ошибка загрузки пользователей'
                    : 'Ошибка загрузки пользователей';
            return rejectWithValue(errorMessage);
        }
    },
);

export const createUser = createAsyncThunk(
    'users/createUser',
    async (
        userData: Omit<
            User,
            'id' | 'created_at' | 'updated_at' | 'roles' | 'permissions'
        > & { roles: string[] },
        { rejectWithValue },
    ) => {
        try {
            const response = await apiClient.post<User>('/users', userData);
            return response.data;
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error && 'response' in error
                    ? (error as { response?: { data?: { message?: string } } })
                          .response?.data?.message ||
                      'Ошибка создания пользователя'
                    : 'Ошибка создания пользователя';
            return rejectWithValue(errorMessage);
        }
    },
);

export const updateUser = createAsyncThunk(
    'users/updateUser',
    async (
        { id, ...userData }: Partial<User> & { id: number; roles?: string[] },
        { rejectWithValue },
    ) => {
        try {
            const response = await apiClient.put<User>(
                `/users/${id}`,
                userData,
            );
            return response.data;
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error && 'response' in error
                    ? (error as { response?: { data?: { message?: string } } })
                          .response?.data?.message ||
                      'Ошибка обновления пользователя'
                    : 'Ошибка обновления пользователя';
            return rejectWithValue(errorMessage);
        }
    },
);

export const deleteUser = createAsyncThunk(
    'users/deleteUser',
    async (userId: number, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/users/${userId}`);
            return userId;
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error && 'response' in error
                    ? (error as { response?: { data?: { message?: string } } })
                          .response?.data?.message ||
                      'Ошибка удаления пользователя'
                    : 'Ошибка удаления пользователя';
            return rejectWithValue(errorMessage);
        }
    },
);

export const fetchRoles = createAsyncThunk(
    'users/fetchRoles',
    async (filters: RoleFilters = {}, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, value.toString());
                }
            });

            const response = await apiClient.get<RolesResponse>(
                `/roles?${params.toString()}`,
            );
            return response.data;
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error && 'response' in error
                    ? (error as { response?: { data?: { message?: string } } })
                          .response?.data?.message || 'Ошибка загрузки ролей'
                    : 'Ошибка загрузки ролей';
            return rejectWithValue(errorMessage);
        }
    },
);

export const fetchPermissions = createAsyncThunk(
    'users/fetchPermissions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get<Permission[]>('/permissions');
            return response.data;
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error && 'response' in error
                    ? (error as { response?: { data?: { message?: string } } })
                          .response?.data?.message ||
                      'Ошибка загрузки разрешений'
                    : 'Ошибка загрузки разрешений';
            return rejectWithValue(errorMessage);
        }
    },
);

export const assignRole = createAsyncThunk(
    'users/assignRole',
    async (
        { userId, role }: { userId: number; role: string },
        { rejectWithValue },
    ) => {
        try {
            const response = await apiClient.post<User>(
                `/users/${userId}/assign-role`,
                { role },
            );
            return response.data;
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error && 'response' in error
                    ? (error as { response?: { data?: { message?: string } } })
                          .response?.data?.message || 'Ошибка назначения роли'
                    : 'Ошибка назначения роли';
            return rejectWithValue(errorMessage);
        }
    },
);

export const removeRole = createAsyncThunk(
    'users/removeRole',
    async (
        { userId, role }: { userId: number; role: string },
        { rejectWithValue },
    ) => {
        try {
            const response = await apiClient.delete<User>(
                `/users/${userId}/remove-role`,
                { data: { role } },
            );
            return response.data;
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error && 'response' in error
                    ? (error as { response?: { data?: { message?: string } } })
                          .response?.data?.message || 'Ошибка удаления роли'
                    : 'Ошибка удаления роли';
            return rejectWithValue(errorMessage);
        }
    },
);

// Slice
const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentUser: (state, action: PayloadAction<User | null>) => {
            state.currentUser = action.payload;
        },
    },
    extraReducers: (builder) => {
        // Fetch Users
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload.data;
                state.pagination = {
                    current_page: action.payload.current_page,
                    last_page: action.payload.last_page,
                    per_page: action.payload.per_page,
                    total: action.payload.total,
                };
                state.error = null;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Create User
        builder
            .addCase(createUser.pending, (state) => {
                state.isCreating = true;
                state.error = null;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.isCreating = false;
                state.users.push(action.payload);
                state.error = null;
            })
            .addCase(createUser.rejected, (state, action) => {
                state.isCreating = false;
                state.error = action.payload as string;
            });

        // Update User
        builder
            .addCase(updateUser.pending, (state) => {
                state.isUpdating = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.isUpdating = false;
                const index = state.users.findIndex(
                    (user) => user.id === action.payload.id,
                );
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
                if (state.currentUser?.id === action.payload.id) {
                    state.currentUser = action.payload;
                }
                state.error = null;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = action.payload as string;
            });

        // Delete User
        builder
            .addCase(deleteUser.pending, (state) => {
                state.isDeleting = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.isDeleting = false;
                state.users = state.users.filter(
                    (user) => user.id !== action.payload,
                );
                if (state.currentUser?.id === action.payload) {
                    state.currentUser = null;
                }
                state.error = null;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.isDeleting = false;
                state.error = action.payload as string;
            });

        // Fetch Roles
        builder
            .addCase(fetchRoles.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchRoles.fulfilled, (state, action) => {
                state.isLoading = false;
                state.roles = action.payload.data;
                state.error = null;
            })
            .addCase(fetchRoles.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch Permissions
        builder.addCase(fetchPermissions.fulfilled, (state, action) => {
            state.permissions = action.payload;
        });

        // Assign Role
        builder.addCase(assignRole.fulfilled, (state, action) => {
            const index = state.users.findIndex(
                (user) => user.id === action.payload.id,
            );
            if (index !== -1) {
                state.users[index] = action.payload;
            }
        });

        // Remove Role
        builder.addCase(removeRole.fulfilled, (state, action) => {
            const index = state.users.findIndex(
                (user) => user.id === action.payload.id,
            );
            if (index !== -1) {
                state.users[index] = action.payload;
            }
        });
    },
});

export const { clearError, setCurrentUser } = usersSlice.actions;
export default usersSlice.reducer;
