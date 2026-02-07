import { useEffect, useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from './components/privacy/Header';
import ProtectionStatusCard from './components/privacy/ProtectionStatusCard';
import TrackerScanner from './components/privacy/TrackerScanner';
import BlocklistManager from './components/privacy/BlocklistManager';
import ProtectionLogView from './components/privacy/ProtectionLogView';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useSeoMetadata } from './seo/useSeoMetadata';

export default function App() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [activeTab, setActiveTab] = useState('scanner');

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Set SEO metadata
  useSeoMetadata({
    title: 'Incognibro - Privacy Dashboard',
    description: 'Privacy dashboard with automatic anti-tracking controls. Detect and block trackers to protect your online privacy.',
  });

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="space-y-8">
            <ProtectionStatusCard />
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
                <TabsTrigger value="scanner">Scanner</TabsTrigger>
                <TabsTrigger value="blocklist">Blocklist</TabsTrigger>
                <TabsTrigger value="log">Activity Log</TabsTrigger>
              </TabsList>
              
              <TabsContent value="scanner" className="mt-6">
                <TrackerScanner />
              </TabsContent>
              
              <TabsContent value="blocklist" className="mt-6">
                <BlocklistManager />
              </TabsContent>
              
              <TabsContent value="log" className="mt-6">
                <ProtectionLogView />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <footer className="border-t mt-16 py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© 2026. Built with ❤️ using <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">caffeine.ai</a></p>
          </div>
        </footer>

        {showProfileSetup && <ProfileSetupDialog />}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
