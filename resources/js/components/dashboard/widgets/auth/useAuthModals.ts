import { useCallback, useReducer } from 'react';

export type LoginMode = 'email' | 'phone';

export type LoginView = 'credentials' | 'phone_code' | 'forgot_password';

export interface LoginFormErrors {
    identifier?: string;
    password?: string;
    code?: string;
    general?: string;
}

export interface RegisterFormErrors {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    passwordConfirmation?: string;
    general?: string;
}

export interface PhoneCodeState {
    token: string;
    maskedPhone: string;
    code: string;
    resendAvailableIn: number;
    expiresAt: string | null;
}

export interface ForgotPasswordState {
    identifier: string;
    sent: boolean;
    message: string;
}

export interface LoginFormState {
    view: LoginView;
    mode: LoginMode;
    identifier: string;
    password: string;
    remember: boolean;
    errors: LoginFormErrors;
    phoneCode: PhoneCodeState;
    forgotPassword: ForgotPasswordState;
}

export interface RegisterFormState {
    name: string;
    email: string;
    phone: string;
    password: string;
    passwordConfirmation: string;
    errors: RegisterFormErrors;
}

interface AuthModalState {
    login: LoginFormState;
    register: RegisterFormState;
}

export type LoginField = 'mode' | 'identifier' | 'password' | 'remember' | 'view' | 'code';
export type RegisterField =
    | 'name'
    | 'email'
    | 'phone'
    | 'password'
    | 'passwordConfirmation';

const INITIAL_PHONE_CODE: PhoneCodeState = {
    token: '',
    maskedPhone: '',
    code: '',
    resendAvailableIn: 0,
    expiresAt: null,
};

const INITIAL_FORGOT_PASSWORD: ForgotPasswordState = {
    identifier: '',
    sent: false,
    message: '',
};

type Action =
    | { type: 'SET_LOGIN_FIELD'; field: LoginField; value: string | boolean }
    | { type: 'SET_REGISTER_FIELD'; field: RegisterField; value: string }
    | { type: 'SET_LOGIN_ERRORS'; errors: LoginFormErrors }
    | { type: 'SET_REGISTER_ERRORS'; errors: RegisterFormErrors }
    | { type: 'SET_PHONE_CODE_STATE'; payload: Partial<PhoneCodeState> }
    | { type: 'SET_FORGOT_PASSWORD_STATE'; payload: Partial<ForgotPasswordState> }
    | { type: 'RESET_LOGIN' }
    | { type: 'RESET_REGISTER' };

const initialState: AuthModalState = {
    login: {
        view: 'credentials',
        mode: 'email',
        identifier: '',
        password: '',
        remember: false,
        errors: {},
        phoneCode: { ...INITIAL_PHONE_CODE },
        forgotPassword: { ...INITIAL_FORGOT_PASSWORD },
    },
    register: {
        name: '',
        email: '',
        phone: '',
        password: '',
        passwordConfirmation: '',
        errors: {},
    },
};

const EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const sanitizeErrors = <T extends Record<string, unknown>>(errors: T): T => {
    const entries = Object.entries(errors).filter(
        ([, value]) => value !== undefined && value !== null && value !== '',
    );
    return Object.fromEntries(entries) as T;
};

const removeFieldError = <T extends Record<string, unknown>>(
    errors: T,
    field: string,
): T => {
    if (!errors[field]) {
        return errors;
    }
    const next = { ...errors };
    delete next[field];
    return next;
};

const reducer = (state: AuthModalState, action: Action): AuthModalState => {
    switch (action.type) {
        case 'SET_LOGIN_FIELD': {
            const { field, value } = action;

            if (field === 'view') {
                const nextView = value as LoginView;
                const forgotPassword = nextView === 'forgot_password'
                    ? { ...INITIAL_FORGOT_PASSWORD, identifier: state.login.identifier }
                    : state.login.forgotPassword;
                return {
                    ...state,
                    login: {
                        ...state.login,
                        view: nextView,
                        errors: {},
                        phoneCode: nextView === 'phone_code' ? { ...INITIAL_PHONE_CODE } : state.login.phoneCode,
                        forgotPassword,
                    },
                };
            }

            if (field === 'mode') {
                const nextMode = value as LoginMode;
                return {
                    ...state,
                    login: {
                        ...initialState.login,
                        mode: nextMode,
                    },
                };
            }

            if (field === 'code') {
                return {
                    ...state,
                    login: {
                        ...state.login,
                        phoneCode: { ...state.login.phoneCode, code: value as string },
                        errors: removeFieldError(state.login.errors, 'code'),
                    },
                };
            }

            const nextLogin = {
                ...state.login,
                [field]: value,
                errors: removeFieldError(
                    removeFieldError(state.login.errors, field),
                    'general',
                ),
            } as LoginFormState;

            return { ...state, login: nextLogin };
        }
        case 'SET_REGISTER_FIELD': {
            const { field, value } = action;
            const nextRegister = {
                ...state.register,
                [field]: value,
                errors: removeFieldError(
                    removeFieldError(state.register.errors, field),
                    'general',
                ),
            } as RegisterFormState;

            return { ...state, register: nextRegister };
        }
        case 'SET_LOGIN_ERRORS': {
            return {
                ...state,
                login: { ...state.login, errors: sanitizeErrors(action.errors) },
            };
        }
        case 'SET_REGISTER_ERRORS': {
            return {
                ...state,
                register: { ...state.register, errors: sanitizeErrors(action.errors) },
            };
        }
        case 'SET_PHONE_CODE_STATE': {
            return {
                ...state,
                login: {
                    ...state.login,
                    phoneCode: { ...state.login.phoneCode, ...action.payload },
                },
            };
        }
        case 'SET_FORGOT_PASSWORD_STATE': {
            return {
                ...state,
                login: {
                    ...state.login,
                    forgotPassword: { ...state.login.forgotPassword, ...action.payload },
                },
            };
        }
        case 'RESET_LOGIN': {
            return { ...state, login: { ...initialState.login } };
        }
        case 'RESET_REGISTER': {
            return { ...state, register: { ...initialState.register } };
        }
        default:
            return state;
    }
};

const isValidPhone = (value: string): boolean => {
    const digitsOnly = value.replace(/\D/g, '');
    return digitsOnly.length === 11 && digitsOnly.startsWith('7');
};

export const useAuthModals = () => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const setLoginField = useCallback(
        (field: LoginField, value: string | boolean) => {
            dispatch({ type: 'SET_LOGIN_FIELD', field, value });
        },
        [],
    );

    const setRegisterField = useCallback(
        (field: RegisterField, value: string) => {
            dispatch({ type: 'SET_REGISTER_FIELD', field, value });
        },
        [],
    );

    const setLoginErrors = useCallback((errors: LoginFormErrors) => {
        dispatch({ type: 'SET_LOGIN_ERRORS', errors });
    }, []);

    const setRegisterErrors = useCallback((errors: RegisterFormErrors) => {
        dispatch({ type: 'SET_REGISTER_ERRORS', errors });
    }, []);

    const setPhoneCodeState = useCallback((payload: Partial<PhoneCodeState>) => {
        dispatch({ type: 'SET_PHONE_CODE_STATE', payload });
    }, []);

    const setForgotPasswordState = useCallback((payload: Partial<ForgotPasswordState>) => {
        dispatch({ type: 'SET_FORGOT_PASSWORD_STATE', payload });
    }, []);

    const resetLoginState = useCallback(() => {
        dispatch({ type: 'RESET_LOGIN' });
    }, []);

    const resetRegisterState = useCallback(() => {
        dispatch({ type: 'RESET_REGISTER' });
    }, []);

    const validateLogin = useCallback(() => {
        const errors: LoginFormErrors = {};
        const identifier = state.login.identifier.trim();
        const password = state.login.password.trim();

        if (!identifier) {
            errors.identifier = 'Укажите email или телефон';
        } else if (state.login.mode === 'email') {
            if (!EMAIL_REGEX.test(identifier)) {
                errors.identifier = 'Введите корректный email';
            }
        } else if (!isValidPhone(identifier)) {
            errors.identifier = 'Введите корректный номер телефона';
        }

        if (!password) {
            errors.password = 'Введите пароль';
        } else if (password.length < 6) {
            errors.password = 'Пароль должен содержать минимум 6 символов';
        }

        setLoginErrors(errors);
        return Object.keys(errors).length === 0;
    }, [state.login.identifier, state.login.mode, state.login.password, setLoginErrors]);

    const validatePhoneForCode = useCallback(() => {
        const errors: LoginFormErrors = {};
        const identifier = state.login.identifier.trim();

        if (!identifier) {
            errors.identifier = 'Укажите номер телефона';
        } else if (!isValidPhone(identifier)) {
            errors.identifier = 'Введите корректный номер телефона';
        }

        setLoginErrors(errors);
        return Object.keys(errors).length === 0;
    }, [state.login.identifier, setLoginErrors]);

    const validateRegister = useCallback(() => {
        const errors: RegisterFormErrors = {};
        const name = state.register.name.trim();
        const email = state.register.email.trim();
        const phone = state.register.phone.trim();
        const password = state.register.password;
        const confirmation = state.register.passwordConfirmation;

        if (!name) {
            errors.name = 'Введите имя';
        }

        if (!email && !phone) {
            errors.email = 'Укажите email или телефон';
            errors.phone = 'Укажите email или телефон';
        } else {
            if (email && !EMAIL_REGEX.test(email)) {
                errors.email = 'Введите корректный email';
            }
            if (phone && !isValidPhone(phone)) {
                errors.phone = 'Введите корректный номер телефона';
            }
        }

        if (!password) {
            errors.password = 'Введите пароль';
        } else if (password.length < 6) {
            errors.password = 'Пароль должен содержать минимум 6 символов';
        }

        if (!confirmation) {
            errors.passwordConfirmation = 'Повторите пароль';
        } else if (confirmation !== password) {
            errors.passwordConfirmation = 'Пароли не совпадают';
        }

        setRegisterErrors(errors);
        return Object.keys(errors).length === 0;
    }, [
        state.register.email,
        state.register.name,
        state.register.password,
        state.register.passwordConfirmation,
        state.register.phone,
        setRegisterErrors,
    ]);

    return {
        loginState: state.login,
        registerState: state.register,
        setLoginField,
        setRegisterField,
        setLoginErrors,
        setRegisterErrors,
        setPhoneCodeState,
        setForgotPasswordState,
        resetLoginState,
        resetRegisterState,
        validateLogin,
        validatePhoneForCode,
        validateRegister,
    };
};
