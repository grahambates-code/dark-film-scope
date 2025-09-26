import { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { Tile3DLayer } from '@deck.gl/geo-layers';
import { MaskExtension } from '@deck.gl/extensions';

interface LocationMap3DProps {
  latitude?: number;
  longitude?: number;
  className?: string;
}

const LocationMap3D = ({ latitude = 40.7128, longitude = -74.0060, className = "" }: LocationMap3DProps) => {
  const [viewState, setViewState] = useState({
    longitude,
    latitude,
    zoom: 16,
    pitch: 45,
    bearing: 0
  });

  // Update view when props change
  useEffect(() => {
    if (latitude && longitude) {
      setViewState(prev => ({
        ...prev,
        latitude,
        longitude
      }));
    }
  }, [latitude, longitude]);

  // 3D Mask parameters
  const targetPosition = [longitude, latitude, 0];
  const innerRadius = 100;
  const fadeRange = 50;

  const layers = [
    new Tile3DLayer({
      id: 'google-3d-tiles',
      data: 'https://tile.googleapis.com/v1/3dtiles/root.json',
      pickable: true,
      _subLayerProps: {
        scenegraph: {
          extensions: [new MaskExtension()],
          pickable: true,
          id: 'google-3d-tiles-2',
          targetPosition: targetPosition,
          innerRadius: innerRadius,
          fadeRange: fadeRange,
        },
      },
      loadOptions: {
        throttleRequests: false,
        maxRequests: 6,
        fetch: {
          headers: {
            'X-GOOG-API-KEY': 'AIzaSyCwmX_Ejr4hEyGDZfgBWPgLYzIqMhY1P3E'
          },
        },
      },
    })
  ];

  const handleViewStateChange = ({ viewState: newViewState }: any) => {
    setViewState(newViewState);
  };

  return (
    <div className={`relative ${className}`}>
      <DeckGL
        initialViewState={{
          longitude,
          latitude,
          zoom: 16,
          pitch: 45,
          bearing: 0
        } as any}
        onViewStateChange={handleViewStateChange}
        layers={layers}
        controller={true}
        style={{ position: 'relative', width: '100%', height: '100%' }}
      />
      
      {/* Overlay with location info */}
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
        <div>3D View</div>
        <div className="text-xs opacity-75">
          Lat: {latitude?.toFixed(4)}, Lng: {longitude?.toFixed(4)}
        </div>
      </div>
      
      {/* Navigation instructions */}
      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-xs max-w-48">
        <div className="font-medium mb-1">Navigation:</div>
        <div>• Drag to rotate</div>
        <div>• Scroll to zoom</div>
        <div>• Hold Shift + drag to pan</div>
      </div>
    </div>
  );
};

export default LocationMap3D;