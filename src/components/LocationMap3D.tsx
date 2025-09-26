import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationMap3DProps {
  latitude?: number;
  longitude?: number;
  className?: string;
}

const LocationMap3D = ({ latitude = 40.7128, longitude = -74.0060, className = "" }: LocationMap3DProps) => {
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/@${latitude},${longitude},19z`;
    window.open(url, '_blank');
  };

  const openInGoogleEarth = () => {
    const url = `https://earth.google.com/web/@${latitude},${longitude},100a,1000d,35y,0h,0t,0r`;
    window.open(url, '_blank');
  };

  return (
    <div className={`relative bg-gradient-to-br from-blue-50 to-green-50 border-2 border-dashed border-gray-300 rounded-lg ${className}`}>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
        <MapPin className="w-16 h-16 text-blue-500 mb-4" />
        
        <h3 className="text-xl font-semibold text-gray-700 mb-2">3D Location View</h3>
        <p className="text-gray-600 mb-6 max-w-md">
          Interactive 3D map coming soon! For now, explore this location in Google Maps or Google Earth.
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={openInGoogleMaps}
            variant="default"
            className="w-full"
          >
            <MapPin className="w-4 h-4 mr-2" />
            View in Google Maps
          </Button>
          
          <Button 
            onClick={openInGoogleEarth}
            variant="outline"
            className="w-full"
          >
            🌍 View in Google Earth
          </Button>
        </div>
        
        {/* Location info */}
        <div className="mt-6 text-xs text-gray-500">
          <div>Lat: {latitude?.toFixed(4)}, Lng: {longitude?.toFixed(4)}</div>
        </div>
      </div>
    </div>
  );
};

export default LocationMap3D;