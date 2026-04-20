'use client';

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useUser, useAuth } from '@/firebase';
import { usePortalUser } from '@/hooks/use-portal-user';
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { LayoutDashboard, Users, LogOut, Loader2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

function SidebarFooterWithToggle() {
    const { state, toggleSidebar } = useSidebar();
    const isExpanded = state === 'expanded';

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={toggleSidebar} tooltip={isExpanded ? "Collapse sidebar" : "Expand sidebar"}>
                    {isExpanded ? <PanelLeftClose /> : <PanelLeftOpen />}
                    <span>{isExpanded ? "Collapse" : "Expand"}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

export function AuthedLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isUserLoading } = useUser();
    const { portalUser, isLoading: isPortalUserLoading } = usePortalUser(user?.uid);
    const auth = useAuth();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    const handleLogout = async () => {
        await auth.signOut();
        router.push('/login');
    };

    const isLoading = isUserLoading || isPortalUserLoading;

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (!user || !portalUser) {
         return (
            <div className="flex h-screen items-center justify-center text-center">
                <div>
                    <p className="mb-4">Could not load user profile. You may not be configured in the system.</p>
                    <Button onClick={handleLogout}>Return to Login</Button>
                </div>
            </div>
        );
    }

    const isAdmin = portalUser.role === 'Admin';
    const userInitial = portalUser.firstName ? portalUser.firstName.charAt(0) : portalUser.email.charAt(0);

    const navItems = [
        { href: '/clients', label: 'Quickbooks', icon: LayoutDashboard, adminOnly: false },
        { href: '/admin/users', label: 'User Management', icon: Users, adminOnly: true },
    ];

    const activeNavItem = navItems.find(item => pathname.startsWith(item.href));

    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarHeader>
                    <Logo />
                </SidebarHeader>
                <SidebarContent>
                    <SidebarMenu>
                        {navItems.map((item) => (
                            (!item.adminOnly || isAdmin) && (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton asChild tooltip={item.label} isActive={pathname.startsWith(item.href)}>
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        ))}
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                   <SidebarFooterWithToggle />
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                 <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background px-4 pb-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <SidebarTrigger className="sm:hidden" />
                    {activeNavItem && (
                      <h1 className="text-xl font-bold">{activeNavItem.label}</h1>
                    )}
                    <div className="flex-grow" />
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-8 w-8 rounded-full"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.photoURL || ''} alt="User avatar" />
                                    <AvatarFallback>{userInitial.toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{portalUser.firstName} {portalUser.lastName}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                 </header>
                 <div className="flex-1 overflow-auto p-2 pt-0">
                    {children}
                 </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
