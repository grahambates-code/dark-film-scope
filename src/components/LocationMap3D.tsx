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
}

const LocationMap3D = ({
                         locationId,
                         viewState,
                         onViewStateChange,
                         className = ""
                       }: LocationMap3DProps) => {
  const deckRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [currentViewState, setCurrentViewState] = useState(viewState);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  // ✅ Memoize the layer so it's only created when needed
  const layers = useMemo(() => [
    new TileLayer({
      id: 'tile-layer',
      data: 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
      maxRequests: 20,
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

  // Animation function to smoothly transition between viewstates
  const animateToViewState = useCallback((targetViewState: any) => {
    if (isAnimating && animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startViewState = { ...currentViewState };
    const startTime = performance.now();
    const duration = 1000; // 1 second animation
    
    setIsAnimating(true);

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easing function for smooth animation (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      // Interpolate all viewstate properties
      const interpolatedViewState = {
        longitude: startViewState.longitude + (targetViewState.longitude - startViewState.longitude) * easedProgress,
        latitude: startViewState.latitude + (targetViewState.latitude - startViewState.latitude) * easedProgress,
        zoom: startViewState.zoom + (targetViewState.zoom - startViewState.zoom) * easedProgress,
        pitch: startViewState.pitch + (targetViewState.pitch - startViewState.pitch) * easedProgress,
        bearing: startViewState.bearing + (targetViewState.bearing - startViewState.bearing) * easedProgress,
      };

      setCurrentViewState(interpolatedViewState);
      onViewStateChange(interpolatedViewState);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [currentViewState, isAnimating, onViewStateChange]);

  // Handle external viewstate changes (from clicking viewstate marks)
  useEffect(() => {
    // Only animate if the viewstate change is significant and not from user interaction
    const hasSignificantChange = 
      Math.abs(viewState.longitude - currentViewState.longitude) > 0.001 ||
      Math.abs(viewState.latitude - currentViewState.latitude) > 0.001 ||
      Math.abs(viewState.zoom - currentViewState.zoom) > 0.1;

    if (hasSignificantChange && !isAnimating) {
      animateToViewState(viewState);
    }
  }, [viewState, currentViewState, isAnimating, animateToViewState]);

  // Initialize currentViewState when component mounts
  useEffect(() => {
    setCurrentViewState(viewState);
  }, []); // Only run on mount

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const saveViewState = async () => {
    setSaving(true);
    try {
      // Create a clean object with only serializable properties
      const cleanViewState = {
        longitude: currentViewState.longitude,
        latitude: currentViewState.latitude,
        zoom: currentViewState.zoom,
        pitch: currentViewState.pitch,
        bearing: currentViewState.bearing
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
            viewState={currentViewState}
            controller={!isAnimating}
            onViewStateChange={({ viewState: newViewState }: any) => {
              if (!isAnimating) {
                setCurrentViewState(newViewState);
                onViewStateChange(newViewState);
              }
            }}
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
          Lat: {currentViewState.latitude?.toFixed(4)}, Lng: {currentViewState.longitude?.toFixed(4)}
          {isAnimating && <span className="ml-2 animate-pulse text-blue-300">Animating...</span>}
        </div>
      </div>
  );
};

export default LocationMap3D;
