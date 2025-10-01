import { useState, useRef } from 'react';
import { Trash2, Save, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TiptapEditor from './TiptapEditor';
import SubCardsOverlay from './SubCardsOverlay';

interface DocumentCardProps {
  mapCard: {
    id: string;
    location_id: string;
    title: string | null;
    content?: string | null;
    user_id: string;
    created_at: string;
    updated_at: string;
  };
  onDelete: (cardId: string) => void;
  onUpdate: (cardId: string, updates: any) => void;
}

const DocumentCard = ({ mapCard, onDelete, onUpdate }: DocumentCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(mapCard.title || 'Untitled Document');
  const [content, setContent] = useState(mapCard.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('map_cards')
        .update({ 
          title,
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', mapCard.id);

      if (error) throw error;

      onUpdate(mapCard.id, { title, content });
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Document saved successfully",
      });
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: "Error",
        description: "Failed to save document",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const { error } = await supabase
        .from('map_cards')
        .delete()
        .eq('id', mapCard.id);

      if (error) throw error;

      onDelete(mapCard.id);
      
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full aspect-square shadow-lg flex flex-col">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="max-w-md"
                placeholder="Document title"
              />
            ) : (
              <CardTitle>{title}</CardTitle>
            )}
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setTitle(mapCard.title || 'Untitled Document');
                    setContent(mapCard.content || '');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-visible relative" ref={containerRef}>
        {isEditing ? (
          <TiptapEditor
            content={content}
            onChange={setContent}
            placeholder="Start writing your document..."
          />
        ) : (
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )}
        
        {/* Sub Cards Overlay */}
        <SubCardsOverlay parentCardId={mapCard.id} containerRef={containerRef} />
      </CardContent>
    </Card>
  );
};

export default DocumentCard;