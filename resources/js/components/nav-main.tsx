import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        {(() => {
                            const isNewTab = item.target === '_blank';
                            const relValue =
                                item.rel ??
                                (isNewTab ? 'noopener noreferrer' : undefined);

                            const content = (
                                <>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                    {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-semibold text-white">
                                            {item.badge > 99 ? '99+' : item.badge}
                                        </span>
                                    )}
                                </>
                            );

                            if (isNewTab) {
                                return (
                                    <SidebarMenuButton
                                        asChild
                                        isActive={false}
                                        tooltip={{ children: item.title }}
                                    >
                                        <a
                                            href={
                                                typeof item.href === 'string'
                                                    ? item.href
                                                    : item.href.url
                                            }
                                            target="_blank"
                                            rel={relValue}
                                        >
                                            {content}
                                        </a>
                                    </SidebarMenuButton>
                                );
                            }

                            return (
                                <SidebarMenuButton
                                    asChild
                                    isActive={page.url.startsWith(
                                        typeof item.href === 'string'
                                            ? item.href
                                            : item.href.url,
                                    )}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link
                                        href={item.href}
                                        prefetch
                                        rel={relValue}
                                    >
                                        {content}
                                    </Link>
                                </SidebarMenuButton>
                            );
                        })()}
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
