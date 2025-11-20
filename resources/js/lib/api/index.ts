// Экспорт всех API модулей
export { apiClient } from '../api';
export { adminApi } from './admin';
export { formsApi } from './forms';
export { newsApi } from './news';
export { organizationsApi } from './organizations';
export { projectsApi } from './projects';
export { sitesApi } from './sites';
export { widgetImagesApi } from './widget-images';
export { widgetsApi } from './widgets';
export { widgetsSystemApi } from './widgets-system';
export { yookassaApi } from './yookassa';

// Экспорт типов
export type {
    FormSubmission,
    FormSubmissionResponse,
    FormSubmissionsResponse,
} from './forms';
export type {
    NewsItem,
    NewsPayload,
    NewsTargetResponse,
    PaginatedNewsResponse,
} from './news';
export type {
    Locality,
    PaginatedResponse as OrganizationPaginatedResponse,
    Region,
    User,
} from './organizations';
export type {
    Donation,
    ReferralLeader,
    RegionData,
    PaginatedResponse as WidgetPaginatedResponse,
} from './widgets';
export type {
    DonationPaymentData,
    DonationWidgetData,
    PaymentMethod,
    Widget,
    WidgetPosition,
    WidgetPositionsResponse,
} from './widgets-system';
