import { useEffect, useRef, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';
import type { MapViewState } from '@deck.gl/core';

function useDebouncedEffect(callback: () => void, delay: number, deps: any[]) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(callback, delay);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, deps);
}

interface LocationMap3DProps {
  latitude?: number;
  longitude?: number;
  className?: string;
}

const LocationMap3D = ({ latitude = 40.7128, longitude = -74.0060, className = "" }: LocationMap3DProps) => {
  const deckRef = useRef(null);
  const [viewState, setViewState] = useState<MapViewState>({
    longitude,
    latitude,
    zoom: 15,
    pitch: 0,
    bearing: 0
  });

  // Update viewState when props change
  useEffect(() => {
    setViewState(prev => ({
      ...prev,
      longitude,
      latitude
    }));
  }, [latitude, longitude]);

  const tileLayer = new TileLayer({
    id: 'tile-layer',
    data: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
    maxRequests: 20,
    pickable: true,
    highlightColor: [60, 60, 60, 40],
    minZoom: 0,
    maxZoom: 19,
    zoomOffset: 2,
    opacity: 1,
    tileSize: 256,
    renderSubLayers: (props: any) => {
      const {
        bbox: { west, south, east, north }
      } = props.tile;

      return [
        new BitmapLayer(props, {
          image: props.data,
          bounds: [west, south, east, north]
        })
      ];
    }
  });

  return (
    <div className={`relative ${className}`} style={{ height: '100%', width: '100%' }}>
      <DeckGL
        ref={deckRef}
        layers={[tileLayer]}
        viewState={viewState}
        controller={true}
        onViewStateChange={({ viewState: newViewState }: any) => setViewState(newViewState)}
      />
      
      {/* Location info overlay */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
        Lat: {latitude?.toFixed(4)}, Lng: {longitude?.toFixed(4)}
      </div>
    </div>
  );
};

export default LocationMap3D;