import { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, DollarSign, Clock, Info, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

interface LocationsListProps {
  productionId: string | null;
}

export function LocationsList({ productionId }: LocationsListProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [production, setProduction] = useState<Production | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productionId) {
      fetchLocationsAndProduction(productionId);
    } else {
      setLocations([]);
      setProduction(null);
    }
  }, [productionId]);

  const fetchLocationsAndProduction = async (prodId: string) => {
    setLoading(true);
    try {
      // Fetch production details and locations in parallel
      const [productionResponse, locationsResponse] = await Promise.all([
        supabase
          .from('productions')
          .select('*')
          .eq('id', prodId)
          .single(),
        supabase
          .from('locations')
          .select('*')
          .eq('production_id', prodId)
          .order('name')
      ]);

      if (productionResponse.error) throw productionResponse.error;
      if (locationsResponse.error) throw locationsResponse.error;

      setProduction(productionResponse.data);
      setLocations(locationsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setProduction(null);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = (latitude: number, longitude: number, name: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  if (!productionId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Select a Production</h3>
          <p className="text-muted-foreground">Choose a production from the sidebar to view its filming locations.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-scout-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      {production && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-2xl font-bold text-foreground">{production.title}</h1>
            <Badge variant="secondary" className="text-xs">
              {production.type.replace('tv_show', 'TV Show').replace('_', ' ')}
            </Badge>
            {production.year && (
              <Badge variant="outline" className="text-xs">
                {production.year}
              </Badge>
            )}
          </div>
          {production.description && (
            <p className="text-muted-foreground mb-4">{production.description}</p>
          )}
          <Separator />
        </div>
      )}

      {locations.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Locations Found</h3>
          <p className="text-muted-foreground">
            This production doesn't have any filming locations recorded yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-scout-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Filming Locations ({locations.length})
            </h2>
          </div>

          <div className="grid gap-4">
            {locations.map((location) => (
              <Card key={location.id} className="bg-card hover:bg-accent/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold text-card-foreground">
                      {location.name}
                    </CardTitle>
                    {location.latitude && location.longitude && (
                      <button
                        onClick={() => openInMaps(location.latitude, location.longitude, location.name)}
                        className="flex items-center gap-1 px-3 py-1 bg-scout-primary/10 hover:bg-scout-primary/20 text-scout-primary rounded-md text-sm transition-colors"
                      >
                        <Navigation className="h-3 w-3" />
                        View on Map
                      </button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {location.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{location.address}</span>
                    </div>
                  )}

                  {location.description && (
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-card-foreground">{location.description}</p>
                    </div>
                  )}

                  {location.latitude && location.longitude && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Navigation className="h-3 w-3" />
                      <span>
                        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}