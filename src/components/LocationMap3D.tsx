import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import DeckGL from '@deck.gl/react';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';
import type { MapViewState } from '@deck.gl/core';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LocationMap3DProps {
  locationId: string;
  viewState: any;
  onViewStateChange: (viewState: any) => void;
  className?: string;
  isInteractive?: boolean;
}

const LocationMap3D = ({
                         locationId,
                         viewState,
                         onViewStateChange,
                         className = "",
                         isInteractive = true
                       }: LocationMap3DProps) => {
  const deckRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  // ✅ Memoize the layer so it's only created when needed
  const layers = useMemo(() => [
    new TileLayer({
      id: 'tile-layer',
      data: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
      maxRequests: 8,
      pickable: true,
      highlightColor: [60, 60, 60, 40],
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      renderSubLayers: props => {
        const {boundingBox} = props.tile;

        return new BitmapLayer(props as any, {
          // @ts-ignore
          data: null,
          image: props.data,
          bounds: [boundingBox[0][0], boundingBox[0][1], boundingBox[1][0], boundingBox[1][1]]
        });
      },
    })
  ], []); // Empty dependency array since the layer config is static

  // Debounced viewstate change handler
  const handleViewStateChange = useCallback(({ viewState: newViewState }: any) => {
    if (isInteractive) {
      onViewStateChange(newViewState);
    }
  }, [onViewStateChange, isInteractive]);

  const saveViewState = async () => {
    setSaving(true);
    try {
      // Create a clean object with only serializable properties
      const cleanViewState = {
        longitude: viewState.longitude,
        latitude: viewState.latitude,
        zoom: viewState.zoom,
        pitch: viewState.pitch,
        bearing: viewState.bearing
      };
      
      // Try to update first, if no row exists it will return no data
      const { data, error: updateError } = await supabase
        .from('location_camera_position')
        .update({ viewstate: cleanViewState })
        .eq('location_id', locationId)
        .select();
      
      // If no rows were updated, create a new record
      if (!updateError && (!data || data.length === 0)) {
        const { error: insertError } = await supabase
          .from('location_camera_position')
          .insert({ 
            location_id: locationId, 
            viewstate: cleanViewState 
          });
        
        if (insertError) throw insertError;
      } else if (updateError) {
        throw updateError;
      }
      
      toast.success('Camera position saved successfully!');
    } catch (error) {
      console.error('Error saving viewstate:', error);
      toast.error('Failed to save camera position. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
      <div className={`bg-white relative ${className}`} style={{ height: '500px', width: '100%' }}>
        <DeckGL
            ref={deckRef}
            layers={layers}
            viewState={
              viewState
              // Remove transition duration for smooth interactions
              //transitionDuration: isInteracting ? 0 : 300,
            }
            controller={isInteractive ? {
              dragRotate: true,
              touchRotate: true,
              keyboard: true,
             scrollZoom: { speed: 0.1, smooth: false },
              doubleClickZoom: true,
              touchZoom: true
            } : false}
            onViewStateChange={handleViewStateChange}
            onDragStart={() => setIsInteracting(true)}
            onDragEnd={() => setIsInteracting(false)}
        />

        {/* Save button */}
        <Button
          onClick={saveViewState}
          disabled={saving}
          size="sm"
          className="absolute bottom-4 right-4 h-8 w-8 p-0"
        >
          <Save className="w-4 h-4" />
        </Button>

        {/* Location info overlay */}
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
          Lat: {viewState.latitude?.toFixed(4)}, Lng: {viewState.longitude?.toFixed(4)}
        </div>
      </div>
  );
};

export default LocationMap3D;
