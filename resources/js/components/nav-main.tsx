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
