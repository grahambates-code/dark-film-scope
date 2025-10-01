import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import DeckGL from '@deck.gl/react';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';
import type { MapViewState } from '@deck.gl/core';
import { Save, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDeckGLManager } from '@/contexts/DeckGLManagerContext';
import MapPlaceholder from '@/components/MapPlaceholder';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldMount, setShouldMount] = useState(false);
  const { registerInstance, unregisterInstance, updateVisibility, canMount } = useDeckGLManager();
  
  // Generate a stable ID for this instance
  const instanceId = useRef(`deck-${locationId}-${Math.random().toString(36).substr(2, 9)}`).current;
  
  // Store refs to avoid stale closures
  const registerRef = useRef(registerInstance);
  const unregisterRef = useRef(unregisterInstance);
  const canMountRef = useRef(canMount);
  
  useEffect(() => {
    registerRef.current = registerInstance;
    unregisterRef.current = unregisterInstance;
    canMountRef.current = canMount;
  }, [registerInstance, unregisterInstance, canMount]);

  // Intersection Observer to detect visibility
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible = entry.isIntersecting;
          setIsVisible(visible);
          updateVisibility(instanceId, visible);

          if (visible) {
            // If visible and can mount, register and mount
            if (canMountRef.current(instanceId)) {
              const registered = registerRef.current(instanceId);
              if (registered) {
                setShouldMount(true);
              }
            }
          } else {
            // If not visible, unmount to free up slot
            setShouldMount(false);
            unregisterRef.current(instanceId);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: '50px' // Start loading slightly before fully visible
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      unregisterRef.current(instanceId);
    };
  }, [instanceId, updateVisibility]);

  // Manual load handler
  const handleManualLoad = useCallback(() => {
    if (canMountRef.current(instanceId)) {
      const registered = registerRef.current(instanceId);
      if (registered) {
        setShouldMount(true);
      }
    }
  }, [instanceId]);

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
      
      // Capture canvas and open in new tab
      if (deckRef.current) {
        // @ts-ignore - accessing deck instance
        const deck = deckRef.current.deck;
        if (deck && deck.canvas) {
          deck.canvas.toBlob((blob: Blob | null) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const newTab = window.open();
              if (newTab) {
                newTab.document.write(`
                  <html>
                    <head><title>Map Capture</title></head>
                    <body style="margin:0;display:flex;justify-content:center;align-items:center;background:#000;">
                      <img src="${url}" style="max-width:100%;max-height:100vh;" />
                    </body>
                  </html>
                `);
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Error saving viewstate:', error);
      toast.error('Failed to save camera position. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDoubleClick = () => {
    saveViewState();
  };

  const captureCanvas = () => {
    if (deckRef.current) {
      // @ts-ignore - accessing deck instance
      const deck = deckRef.current.deck;
      if (deck && deck.canvas) {
        deck.canvas.toBlob((blob: Blob | null) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const newTab = window.open();
            if (newTab) {
              newTab.document.write(`
                <html>
                  <head><title>Map Capture</title></head>
                  <body style="margin:0;display:flex;justify-content:center;align-items:center;background:#000;">
                    <img src="${url}" style="max-width:100%;max-height:100vh;" />
                  </body>
                </html>
              `);
            }
          }
        });
      }
    }
  };

  return (
      <div ref={containerRef} className={`bg-white relative ${className}`} style={{ height: '500px', width: '100%' }}>
        {!shouldMount ? (
          <MapPlaceholder onLoad={handleManualLoad} className={className} />
        ) : (
          <>
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

        {/* Capture button */}
        <Button
          onClick={captureCanvas}
          size="sm"
          className="absolute bottom-4 right-14 h-8 w-8 p-0"
          title="Capture canvas as image"
        >
          <Camera className="w-4 h-4" />
        </Button>

        {/* Save button */}
        <Button
          onDoubleClick={handleSaveDoubleClick}
          disabled={saving}
          size="sm"
          className="absolute bottom-4 right-4 h-8 w-8 p-0"
          title="Double-click to save camera position"
        >
          <Save className="w-4 h-4" />
        </Button>

            {/* Location info overlay */}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
              Lat: {viewState.latitude?.toFixed(4)}, Lng: {viewState.longitude?.toFixed(4)}
            </div>
          </>
        )}
      </div>
  );
};

export default LocationMap3D;
