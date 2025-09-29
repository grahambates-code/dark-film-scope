import { useState, useEffect } from 'react';
import { Film } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import AuthForm from '@/components/AuthForm';
import { LocationsList } from '@/components/LocationsList';
import { AppHeader } from '@/components/AppHeader';
import { supabase } from '@/integrations/supabase/client';
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

  useEffect(() => {
    // Fetch the first production on mount
    const fetchFirstProduction = async () => {
      try {
        const { data, error } = await supabase
          .from('productions')
          .select('id')
          .order('created_at')
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching first production:', error);
          return;
        }

        if (data) {
          setSelectedProductionId(data.id);
        }
      } catch (error) {
        console.error('Error fetching first production:', error);
      }
    };

    fetchFirstProduction();
  }, []);

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