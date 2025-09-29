import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ChevronRight, FileText, Home } from 'lucide-react';
import React from 'react';

interface Page {
    id: number;
    title: string;
    slug: string;
    url: string;
    is_homepage: boolean;
    children?: Page[];
}

interface PageNavigationProps {
    pages: Page[];
    currentPageId?: number;
    organizationDomain: string;
}

const PageNavigation: React.FC<PageNavigationProps> = ({
    pages,
    currentPageId,
    organizationDomain,
}) => {
    const renderPageItem = (page: Page, level: number = 0) => {
        const isActive = page.id === currentPageId;
        const hasChildren = page.children && page.children.length > 0;

        return (
            <div key={page.id} className="space-y-1">
                <Link
                    href={page.url}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted hover:text-foreground'
                    } ${level > 0 ? 'ml-4' : ''}`}
                >
                    {page.is_homepage ? (
                        <Home className="h-4 w-4 flex-shrink-0" />
                    ) : (
                        <FileText className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="truncate">{page.title}</span>
                    {hasChildren && (
                        <ChevronRight className="ml-auto h-3 w-3 flex-shrink-0" />
                    )}
                </Link>

                {/* Рекурсивно рендерим дочерние страницы */}
                {hasChildren && (
                    <div className="space-y-1">
                        {page.children!.map((child) =>
                            renderPageItem(child, level + 1),
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (!pages || pages.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-muted-foreground text-center">
                        <FileText className="mx-auto mb-2 h-8 w-8 opacity-50" />
                        <p className="text-sm">Страницы не найдены</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-1">
                    {pages.map((page) => renderPageItem(page))}
                </div>
            </CardContent>
        </Card>
    );
};

export default PageNavigation;
