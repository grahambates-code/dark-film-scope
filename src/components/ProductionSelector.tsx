import { useState, useEffect } from 'react';
import { ChevronDown, Film, Tv, FileText, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Production {
  id: string;
  title: string;
  type: string;
  year: number;
  description: string;
}

interface ProductionSelectorProps {
  selectedProductionId: string | null;
  onProductionSelect: (productionId: string) => void;
  className?: string;
}

const getProductionIcon = (type: string) => {
  switch (type) {
    case 'film':
      return Film;
    case 'tv_show':
      return Tv;
    case 'documentary':
      return FileText;
    case 'short':
      return Film;
    default:
      return Film;
  }
};

const formatProductionType = (type: string) => {
  switch (type) {
    case 'tv_show':
      return 'TV Show';
    case 'documentary':
      return 'Documentary';
    case 'short':
      return 'Short Film';
    case 'film':
      return 'Film';
    default:
      return type;
  }
};

export function ProductionSelector({ selectedProductionId, onProductionSelect, className }: ProductionSelectorProps) {
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductions();
  }, []);

  const fetchProductions = async () => {
    try {
      const { data, error } = await supabase
        .from('productions')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw error;
      setProductions(data || []);
    } catch (error) {
      console.error('Error fetching productions:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedProduction = productions.find(p => p.id === selectedProductionId);

  if (loading) {
    return (
      <div className={`h-10 w-48 bg-muted animate-pulse rounded-md ${className}`} />
    );
  }

  return (
    <Select value={selectedProductionId || ''} onValueChange={onProductionSelect}>
      <SelectTrigger className={`w-fit min-w-48 ${className}`}>
        <SelectValue placeholder="Select a production">
          {selectedProduction && (
            <div className="flex items-center gap-2">
              {(() => {
                const IconComponent = getProductionIcon(selectedProduction.type);
                return <IconComponent className="h-4 w-4" />;
              })()}
              <span className="font-medium">{selectedProduction.title}</span>
              {selectedProduction.year && (
                <span className="text-muted-foreground text-sm">({selectedProduction.year})</span>
              )}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {productions.map((production) => {
          const IconComponent = getProductionIcon(production.type);
          return (
            <SelectItem key={production.id} value={production.id}>
              <div className="flex items-center gap-3 w-full">
                <IconComponent className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {production.title}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{formatProductionType(production.type)}</span>
                    {production.year && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{production.year}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}