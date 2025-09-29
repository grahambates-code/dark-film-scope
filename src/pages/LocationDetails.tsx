import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import AuthForm from '@/components/AuthForm';
import { AppHeader } from '@/components/AppHeader';
import MapCard from '@/components/MapCard';

interface Location {
  id: string;
  production_id: string;
  name: string;
  address: string;
  description: string;
  latitude: number;
  longitude: number;
}

interface Production {
  id: string;
  title: string;
  type: string;
  year: number;
  description: string;
}

interface MapCardData {
  id: string;
  location_id: string;
  title: string | null;
  viewstate: any;
  user_id: string;
  created_at: string;
  updated_at: string;
}
const LocationDetails = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [location, setLocation] = useState<Location | null>(null);
  const [production, setProduction] = useState<Production | null>(null);
  const [mapCards, setMapCards] = useState<MapCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (locationId) {
      fetchLocationDetails(locationId);
    }
  }, [locationId]);

  const fetchLocationDetails = async (locId: string) => {
    try {
      setLoading(true);

      // Fetch location details
      const { data: locationData, error: locationError } = await supabase
        .from('locations')
        .select('*')
        .eq('id', locId)
        .single();
      
      if (locationError) throw locationError;
      setLocation(locationData);

      // Fetch production details
      if (locationData.production_id) {
        const { data: productionData, error: productionError } = await supabase
          .from('productions')
          .select('*')
          .eq('id', locationData.production_id)
          .single();
        
        if (productionError) throw productionError;
        setProduction(productionData);
      }

      // Fetch map cards for this location
      const { data: mapCardsData, error: mapCardsError } = await supabase
        .from('map_cards')
        .select('*')
        .eq('location_id', locId)
        .order('created_at', { ascending: false });
      
      if (mapCardsError) throw mapCardsError;
      setMapCards(mapCardsData || []);

    } catch (error) {
      console.error('Error fetching location details:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleCreateCard = async () => {
    if (!user || !locationId) return;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('map_cards')
        .insert({
          location_id: locationId,
          title: 'New Map Card',
          viewstate: {
            longitude: location?.longitude || -74.0060,
            latitude: location?.latitude || 40.7128,
            zoom: 15,
            pitch: 0,
            bearing: 0
          },
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      setMapCards(prev => [...prev, data]);
      
      // Scroll to the new card after a brief delay to ensure it's rendered
      setTimeout(() => {
        const newCardElement = document.getElementById(`map-card-${data.id}`);
        if (newCardElement) {
          newCardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } catch (error) {
      console.error('Error creating map card:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    setMapCards(prev => prev.filter(card => card.id !== cardId));
  };

  const handleUpdateCard = (cardId: string, updates: Partial<MapCardData>) => {
    setMapCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, ...updates } : card
    ));
  };
  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-scout-primary"></div>
      </div>;
  }
  if (!user) {
    return <AuthForm onAuthSuccess={() => {}} />;
  }
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-scout-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading location details...</p>
        </div>
      </div>;
  }
  if (!location) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Location not found</h2>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>;
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader variant="location" locationName={location.name} production={production} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Map Cards */}
        <div className="space-y-8">
          {mapCards.map((mapCard) => (
            <div key={mapCard.id} id={`map-card-${mapCard.id}`}>
              <MapCard
                mapCard={mapCard}
                onDelete={handleDeleteCard}
                onUpdate={handleUpdateCard}
              />
            </div>
          ))}

          {mapCards.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No map cards yet. Create your first one!</p>
            </div>
          )}
        </div>

        {/* Add New Card Button */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleCreateCard}
            disabled={creating}
            size="lg"
            className="px-8 py-3"
          >
            <Plus className="w-5 h-5 mr-2" />
            {creating ? 'Creating...' : 'Add New Card'}
          </Button>
        </div>
      </div>
    </div>
  );
};
export default LocationDetails;