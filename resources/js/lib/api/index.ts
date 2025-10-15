// Экспорт всех API модулей
export { apiClient } from '../api';
export { adminApi } from './admin';
export { formsApi } from './forms';
export { organizationsApi } from './organizations';
export { sitesApi } from './sites';
export { widgetImagesApi } from './widget-images';
export { widgetsApi } from './widgets';
export { widgetsSystemApi } from './widgets-system';

// Экспорт типов
export type {
    FormSubmission,
    FormSubmissionResponse,
    FormSubmissionsResponse,
} from './forms';
export type {
    City,
    PaginatedResponse as OrganizationPaginatedResponse,
    Region,
    Settlement,
    User,
} from './organizations';
export type {
    Donation,
    ReferralLeader,
    RegionData,
    PaginatedResponse as WidgetPaginatedResponse,
} from './widgets';
export type {
    DonationWidgetData,
    PaymentMethod,
    Widget,
    WidgetPosition,
    WidgetPositionsResponse,
} from './widgets-system';
