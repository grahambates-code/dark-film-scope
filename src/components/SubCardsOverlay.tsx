import { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import SubCard from './SubCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SubCardData {
  id: string;
  parent_card_id: string;
  user_id: string;
  content_type: 'text' | 'image' | 'color';
  content: string | null;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  z_index: number;
  background_color: string | null;
}

interface SubCardsOverlayProps {
  parentCardId: string;
  containerRef: React.RefObject<HTMLDivElement>;
}

const SubCardsOverlay = ({ parentCardId, containerRef }: SubCardsOverlayProps) => {
  const { user } = useAuth();
  const [subCards, setSubCards] = useState<SubCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubCards();
  }, [parentCardId]);

  const fetchSubCards = async () => {
    try {
      const { data, error } = await supabase
        .from('sub_cards')
        .select('*')
        .eq('parent_card_id', parentCardId)
        .order('z_index', { ascending: true });

      if (error) throw error;
      setSubCards((data || []).map(card => ({
        ...card,
        content_type: card.content_type as 'text' | 'image' | 'color'
      })));
    } catch (error) {
      console.error('Error fetching sub cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubCard = async (type: 'text' | 'image' | 'color') => {
    if (!user || !containerRef.current) return;

    try {
      const containerRect = containerRef.current.getBoundingClientRect();
      const size = type === 'text' ? 150 : 120;
      
      // Random position within container
      const maxX = containerRect.width - size;
      const maxY = containerRect.height - size;
      const randomX = Math.random() * Math.max(0, maxX);
      const randomY = Math.random() * Math.max(0, maxY);

      const colors = ['#fef3c7', '#dbeafe', '#fce7f3', '#dcfce7', '#e0e7ff'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const { data, error } = await supabase
        .from('sub_cards')
        .insert({
          parent_card_id: parentCardId,
          user_id: user.id,
          content_type: type,
          content: type === 'text' ? 'New note' : null,
          position_x: randomX,
          position_y: randomY,
          width: size,
          height: size,
          z_index: subCards.length,
          background_color: type === 'color' ? randomColor : type === 'text' ? '#fef3c7' : '#ffffff'
        })
        .select()
        .single();

      if (error) throw error;
      setSubCards(prev => [...prev, { ...data, content_type: data.content_type as 'text' | 'image' | 'color' }]);
      toast.success('Sub card added');
    } catch (error) {
      console.error('Error creating sub card:', error);
      toast.error('Failed to create sub card');
    }
  };

  const handleUpdateSubCard = async (id: string, updates: Partial<SubCardData>) => {
    try {
      const { error } = await supabase
        .from('sub_cards')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setSubCards(prev => prev.map(card => 
        card.id === id ? { ...card, ...updates } : card
      ));
    } catch (error) {
      console.error('Error updating sub card:', error);
      toast.error('Failed to update sub card');
    }
  };

  const handleDeleteSubCard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sub_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubCards(prev => prev.filter(card => card.id !== id));
      toast.success('Sub card deleted');
    } catch (error) {
      console.error('Error deleting sub card:', error);
      toast.error('Failed to delete sub card');
    }
  };

  if (loading) return null;

  return (
    <>
      {subCards.map((subCard) => (
        <SubCard
          key={subCard.id}
          subCard={subCard}
          onUpdate={handleUpdateSubCard}
          onDelete={handleDeleteSubCard}
          containerRef={containerRef}
        />
      ))}
      
      {user && (
        <div className="absolute bottom-2 right-2 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 rounded-full shadow-lg"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleCreateSubCard('text')}>
                Add Text Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateSubCard('color')}>
                Add Color Block
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </>
  );
};

export default SubCardsOverlay;
