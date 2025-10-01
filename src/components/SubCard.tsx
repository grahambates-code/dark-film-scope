import { useState, useRef, useEffect } from 'react';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/AuthProvider';

interface SubCardProps {
  subCard: {
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
  };
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  containerRef: React.RefObject<HTMLElement>;
}

const SubCard = ({ subCard, onUpdate, onDelete, containerRef }: SubCardProps) => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(subCard.content || '');
  const [position, setPosition] = useState({ x: subCard.position_x, y: subCard.position_y });
  const dragStart = useRef({ x: 0, y: 0 });
  const subCardRef = useRef<HTMLDivElement>(null);

  const isOwner = user?.id === subCard.user_id;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isOwner || isEditing) return;
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const subCardWidth = subCard.width;
      const subCardHeight = subCard.height;

      let newX = e.clientX - dragStart.current.x;
      let newY = e.clientY - dragStart.current.y;

      // Constrain to container bounds
      newX = Math.max(0, Math.min(newX, containerRect.width - subCardWidth));
      newY = Math.max(0, Math.min(newY, containerRect.height - subCardHeight));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        // Save position to database
        onUpdate(subCard.id, {
          position_x: position.x,
          position_y: position.y
        });
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position, onUpdate, subCard.id, subCard.width, subCard.height, containerRef]);

  const handleSaveEdit = () => {
    onUpdate(subCard.id, { content: editContent });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(subCard.content || '');
    setIsEditing(false);
  };

  const renderContent = () => {
    if (isEditing && subCard.content_type === 'text') {
      return (
        <div className="flex flex-col gap-2 p-2 h-full">
          <Input
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="text-xs"
            placeholder="Enter text..."
            autoFocus
          />
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-6 p-1" onClick={handleSaveEdit}>
              <Check className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="ghost" className="h-6 p-1" onClick={handleCancelEdit}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      );
    }

    switch (subCard.content_type) {
      case 'text':
        return (
          <div className="p-2 text-xs break-words overflow-hidden">
            {subCard.content || 'Click to edit'}
          </div>
        );
      case 'image':
        return subCard.content ? (
          <img 
            src={subCard.content} 
            alt="Sub card" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            No image
          </div>
        );
      case 'color':
        return <div className="w-full h-full" />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={subCardRef}
      className={`absolute rounded-lg shadow-lg overflow-hidden transition-shadow ${
        isDragging ? 'shadow-2xl cursor-grabbing' : isOwner ? 'cursor-grab hover:shadow-xl' : ''
      } ${isOwner ? 'group' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${subCard.width}px`,
        height: `${subCard.height}px`,
        zIndex: subCard.z_index + 10,
        backgroundColor: subCard.background_color || '#ffffff',
      }}
      onMouseDown={handleMouseDown}
    >
      {renderContent()}
      
      {isOwner && !isEditing && (
        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {subCard.content_type === 'text' && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 bg-white/90 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              <Edit2 className="w-3 h-3" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 bg-white/90 hover:bg-white hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(subCard.id);
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SubCard;
