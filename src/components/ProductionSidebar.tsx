import { useState, useEffect } from 'react';
import { Film, Tv, FileText, Calendar, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

interface Production {
  id: string;
  title: string;
  type: string;
  year: number;
  description: string;
}

interface ProductionSidebarProps {
  selectedProductionId: string | null;
  onProductionSelect: (productionId: string) => void;
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

export function ProductionSidebar({ selectedProductionId, onProductionSelect }: ProductionSidebarProps) {
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

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

  if (loading) {
    return (
      <Sidebar className={collapsed ? "w-14" : "w-80"}>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Loading...</SidebarGroupLabel>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className={collapsed ? "w-14" : "w-80"}>
      <SidebarContent className="bg-sidebar pt-20">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground">
            {!collapsed && "Productions"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {productions.map((production) => {
                const IconComponent = getProductionIcon(production.type);
                const isActive = selectedProductionId === production.id;
                
                return (
                  <SidebarMenuItem key={production.id}>
                    <SidebarMenuButton
                      asChild
                      className={`cursor-pointer transition-colors ${
                        isActive 
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                          : 'hover:bg-sidebar-accent/50'
                      }`}
                      onClick={() => onProductionSelect(production.id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <IconComponent className="h-4 w-4 flex-shrink-0" />
                          {!collapsed && (
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm truncate">
                                {production.title}
                              </div>
                              <div className="text-xs text-sidebar-foreground/60 flex items-center gap-2">
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
                          )}
                        </div>
                        {!collapsed && isActive && (
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}