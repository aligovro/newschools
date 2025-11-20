import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    Building2,
    CalendarClock,
    CreditCard,
    FileText,
    Folder,
    Globe,
    Home,
    LayoutGrid,
    Settings,
    Target,
    Users,
    Lightbulb,
} from 'lucide-react';

export function AppSidebar() {
    const { props } = usePage();
    const rawTerminology = (props as any).terminology;
    const auth = (props as any)?.auth;
    const authUser = auth?.user;
    const unviewedSuggestedOrganizationsCount = auth?.unviewedSuggestedOrganizationsCount ?? 0;
    const roleNames = Array.isArray(authUser?.roles)
        ? (authUser.roles as Array<{ name?: string | null }>)
              .map((role) => role?.name)
              .filter(Boolean) as string[]
        : [];
    const isSuperAdmin = roleNames.includes('super_admin');

    // Получаем plural_nominative с поддержкой разных форматов
    const getPluralNominative = () => {
        if (!rawTerminology) {
            return 'Организации';
        }

        // Проверяем разные варианты структуры
        if (rawTerminology.organization?.plural_nominative) {
            return rawTerminology.organization.plural_nominative;
        }
        if (rawTerminology.plural_nominative) {
            return rawTerminology.plural_nominative;
        }

        return 'Организации';
    };

    const organizationsTitle = getPluralNominative();

    const mainNavItems: NavItem[] = [
        {
            title: 'Админ панель',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Главный сайт',
            href: '/',
            icon: Home,
            target: '_blank',
        },
        {
            title: 'Пользователи',
            href: '/dashboard/users',
            icon: Users,
        },
        {
            title: organizationsTitle,
            href: '/dashboard/organizations',
            icon: Building2,
        },
        ...(isSuperAdmin
            ? [
                  {
                      title: 'Предложенные школы',
                      href: '/dashboard/suggested-organizations',
                      icon: Lightbulb,
                      badge: unviewedSuggestedOrganizationsCount > 0 ? unviewedSuggestedOrganizationsCount : undefined,
                  } satisfies NavItem,
                  {
                      title: 'Все отчеты',
                      href: '/dashboard/reports',
                      icon: FileText,
                  } satisfies NavItem,
                  {
                      title: 'ЮKassa',
                      href: '/dashboard/yookassa/merchants',
                      icon: CreditCard,
                  } satisfies NavItem,
              ]
            : []),
        {
            title: 'Проекты',
            href: '/dashboard/projects',
            icon: Target,
        },
        {
            title: 'События',
            href: '/dashboard/news',
            icon: CalendarClock,
        },
        {
            title: 'Сайты',
            href: '/dashboard/sites',
            icon: Globe,
        },
        {
            title: 'Статистика',
            href: '/dashboard/statistics',
            icon: BarChart3,
        },
        {
            title: 'Настройки',
            href: '/dashboard/settings',
            icon: Settings,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: Folder,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader></SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
