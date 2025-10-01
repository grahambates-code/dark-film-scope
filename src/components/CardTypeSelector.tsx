import { Map, Image, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CardTypeSelectorProps {
  onSelectType: (type: 'map' | 'image' | 'document') => void;
  onCancel: () => void;
}

const CardTypeSelector = ({ onSelectType, onCancel }: CardTypeSelectorProps) => {
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-2 border-orange-200 bg-card">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Choose Card Type</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => onSelectType('map')}
            className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 hover:border-orange-300 transition-colors"
          >
            <Map className="h-8 w-8 text-orange-600" />
            <span className="font-medium">Map Card</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => onSelectType('image')}
            className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 hover:border-orange-300 transition-colors"
          >
            <Image className="h-8 w-8 text-orange-600" />
            <span className="font-medium">Image Card</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => onSelectType('document')}
            className="h-24 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 hover:border-orange-300 transition-colors"
          >
            <FileText className="h-8 w-8 text-orange-600" />
            <span className="font-medium">Document</span>
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground text-center mt-4">
          Select the type of card you want to create
        </p>
      </CardContent>
    </Card>
  );
};

export default CardTypeSelector;