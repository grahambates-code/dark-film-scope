import { useState } from 'react';
import { Film } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import AuthForm from '@/components/AuthForm';
import { LocationsList } from '@/components/LocationsList';
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

  return <IndexContent />;
};

const IndexContent = () => {
  const [selectedProductionId, setSelectedProductionId] = useState<string | null>(null);

  const handleProductionSelect = (productionId: string) => {
    setSelectedProductionId(productionId);
  };

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <AppHeader variant="home" />

      {/* Main Content */}
      <main className="pt-[73px] px-6">
        <LocationsList 
          productionId={selectedProductionId}
          onProductionSelect={handleProductionSelect}
        />
      </main>
    </div>
  );
};
export default Index;