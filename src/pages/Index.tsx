import { useState } from 'react';
import { Film, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import AuthForm from '@/components/AuthForm';
import { ProductionSidebar } from '@/components/ProductionSidebar';
import { LocationsList } from '@/components/LocationsList';
import { SidebarProvider, SidebarTrigger, SidebarInset, useSidebar } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/AppHeader';
const Index = () => {
  const { user, loading } = useAuth();

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

  return (
    <SidebarProvider>
      <IndexContent />
    </SidebarProvider>
  );
};

const IndexContent = () => {
  const [selectedProductionId, setSelectedProductionId] = useState<string | null>(null);
  const { setOpen } = useSidebar();

  const handleProductionSelect = (productionId: string) => {
    setSelectedProductionId(productionId);
    setOpen(false); // Collapse sidebar when production is selected
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Header */}
      <AppHeader variant="home" />

      {/* Sidebar */}
      <ProductionSidebar 
        selectedProductionId={selectedProductionId}
        onProductionSelect={handleProductionSelect}
      />

      {/* Main Content */}
      <SidebarInset>
        <main className="flex-1 pt-[73px] pl-12">
          <LocationsList 
            productionId={selectedProductionId}
            onProductionSelect={handleProductionSelect}
          />
        </main>
      </SidebarInset>
    </div>
  );
};
export default Index;