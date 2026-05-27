import Image from "next/image";
import HeroSection from "@/components/hero-section";
import FooterSection from "@/components/footer";
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const { userId } = await auth();
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <HeroSection />
      </main>
      <FooterSection />
    </div>
  );
}