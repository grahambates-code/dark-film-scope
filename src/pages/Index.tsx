import { useState } from 'react';
import { Film, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import AuthForm from '@/components/AuthForm';
import { ProductionSidebar } from '@/components/ProductionSidebar';
import { LocationsList } from '@/components/LocationsList';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [selectedProductionId, setSelectedProductionId] = useState<string | null>(null);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Film className="w-6 h-6 text-scout-primary animate-pulse" />
          <span className="text-scout-text">Loading...</span>
        </div>
      </div>
    );
  }

  // Show auth form if user is not logged in
  if (!user) {
    return <AuthForm onAuthSuccess={() => {}} />;
  }

  const handleProductionSelect = (productionId: string) => {
    setSelectedProductionId(productionId);
  };
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-scout-surface/95 backdrop-blur-sm border-b border-scout-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="mr-2" />
              <Film className="w-6 h-6 text-scout-primary" />
              <h1 className="text-lg font-bold text-scout-primary">FilmScout Pro</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut}
                className="border-scout-border text-scout-text hover:bg-scout-surface-alt"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Sidebar */}
        <ProductionSidebar 
          selectedProductionId={selectedProductionId}
          onProductionSelect={handleProductionSelect}
        />

        {/* Main Content */}
        <main className="flex-1 pt-[73px]">
          <LocationsList productionId={selectedProductionId} />
        </main>
      </div>
    </SidebarProvider>
  );
};
export default Index;