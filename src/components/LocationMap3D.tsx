import { useEffect, useRef, useState, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';
import type { MapViewState } from '@deck.gl/core';

interface LocationMap3DProps {
  latitude?: number;
  longitude?: number;
  className?: string;
}

const LocationMap3D = ({
                         latitude = 40.7128,
                         longitude = -74.0060,
                         className = ""
                       }: LocationMap3DProps) => {
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

  return (
      <div className={`bg-white relative ${className}`} style={{ height: '500px', width: '100%' }}>
        <DeckGL
            ref={deckRef}
            layers={layers}
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
