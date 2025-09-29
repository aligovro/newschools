import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/common/ui/avatar';
import { Button } from '@/components/common/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/common/ui/dropdown-menu';
import { Link } from '@inertiajs/react';
import {
    Bell,
    ExternalLink,
    LogOut,
    Search,
    Settings,
    User,
} from 'lucide-react';

interface Organization {
    id: number;
    name: string;
    slug: string;
    domain?: string;
}

interface OrganizationAdminHeaderProps {
    organization: Organization;
    className?: string;
}

export function OrganizationAdminHeader({
    organization,
    className,
}: OrganizationAdminHeaderProps) {
    return (
        <header
            className={`flex items-center justify-between bg-background px-6 py-4 ${className}`}
        >
            {/* Left side - Search and notifications */}
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Поиск..."
                        className="border-input focus:ring-ring w-64 rounded-md border bg-background py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2"
                    />
                </div>
            </div>

            {/* Right side - User menu and actions */}
            <div className="flex items-center space-x-4">
                {/* Notifications */}
                <Button variant="ghost" size="sm">
                    <Bell className="h-4 w-4" />
                </Button>

                {/* View Site Button */}
                <Button variant="outline" size="sm" asChild>
                    <Link
                        href={
                            organization.domain
                                ? `https://${organization.domain}`
                                : route(
                                      'organization.public',
                                      organization.slug,
                                  )
                        }
                        target="_blank"
                    >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Посмотреть сайт
                    </Link>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative h-8 w-8 rounded-full"
                        >
                            <Avatar className="h-8 w-8">
                                <AvatarImage
                                    src="/placeholder-avatar.jpg"
                                    alt="User"
                                />
                                <AvatarFallback>
                                    <User className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-56"
                        align="end"
                        forceMount
                    >
                        <div className="flex flex-col space-y-1 p-2">
                            <p className="text-sm font-medium leading-none">
                                Администратор
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {organization.name}
                            </p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={route('profile.edit')}>
                                <User className="mr-2 h-4 w-4" />
                                <span>Профиль</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link
                                href={route(
                                    'organization.admin.settings',
                                    organization.slug,
                                )}
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Настройки</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={route('logout')} method="post">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Выйти</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
