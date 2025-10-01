import { Map } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapPlaceholderProps {
  onLoad?: () => void;
  className?: string;
}

const MapPlaceholder = ({ onLoad, className = "" }: MapPlaceholderProps) => {
  return (
    <div 
      className={`bg-muted relative flex items-center justify-center ${className}`} 
      style={{ height: '500px', width: '100%' }}
    >
      <div className="flex flex-col items-center gap-4 text-center p-6">
        <div className="rounded-full bg-background p-4 shadow-sm">
          <Map className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Map Not Loaded</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Scroll this card into view to load the interactive map
          </p>
        </div>
        {onLoad && (
          <Button 
            onClick={onLoad}
            size="sm"
            variant="outline"
            className="mt-2"
          >
            Load Map Now
          </Button>
        )}
      </div>
    </div>
  );
};

export default MapPlaceholder;
