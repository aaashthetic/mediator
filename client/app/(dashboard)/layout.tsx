import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import Onboarding from "@/components/onboarding-client-form";
import { Suspense } from "react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { userId} = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    return (
        <div className="min-h-screen bg-background transition-colors">
        <div className="lg:pl-64">
            <Sidebar />
            <main className="py-8 px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<div className="text-muted-foreground font-sans">Loading dashboard...</div>}>
                {children}
            </Suspense>
            </main>
        </div>
        </div>
    );
}