import { useState, useEffect } from 'react';
import { User, Send, Trash2, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/AuthProvider';
import TiptapEditor from '@/components/TiptapEditor';
import CommentRenderer from '@/components/CommentRenderer';
import LocationMap3D from '@/components/LocationMap3D';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface MapCardData {
  id: string;
  location_id: string;
  title: string | null;
  viewstate: any;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  map_card_id?: string;
  profiles?: {
    display_name: string | null;
  };
}

interface MapCardProps {
  mapCard: MapCardData;
  onDelete?: (cardId: string) => void;
  onUpdate?: (cardId: string, updates: Partial<MapCardData>) => void;
}

const MapCard = ({ mapCard, onDelete, onUpdate }: MapCardProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentFormVisible, setCommentFormVisible] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(mapCard.title || '');
  const [isMapActive, setIsMapActive] = useState(false);
  const [viewState, setViewState] = useState(mapCard.viewstate || {
    longitude: -74.0060,
    latitude: 40.7128,
    zoom: 15,
    pitch: 0,
    bearing: 0
  });

  useEffect(() => {
    fetchComments();
  }, [mapCard.id]);

  // Update viewState when mapCard.viewstate changes (on refresh or data load)
  useEffect(() => {
    if (mapCard.viewstate) {
      setViewState(mapCard.viewstate);
    }
  }, [mapCard.viewstate]);

  const fetchComments = async () => {
    try {
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!comments_user_id_fkey(display_name)
        `)
        .eq('map_card_id', mapCard.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(commentsData || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          map_card_id: mapCard.id,
          location_id: mapCard.location_id,
          content: newComment,
          user_id: user.id
        } as any)
        .select(`
          *,
          profiles!comments_user_id_fkey(display_name)
        `)
        .single();

      if (error) throw error;

      setComments(prev => [data, ...prev]);
      setNewComment('');
      setCommentFormVisible(false);
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user?.id);

      if (error) throw error;
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleSaveTitle = async () => {
    try {
      const { error } = await supabase
        .from('map_cards')
        .update({ title })
        .eq('id', mapCard.id)
        .eq('user_id', user?.id);

      if (error) throw error;

      onUpdate?.(mapCard.id, { ...mapCard, title });
      setEditingTitle(false);
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const handleDeleteCard = async () => {
    if (!user || user.id !== mapCard.user_id) return;

    try {
      // Delete associated comments first
      await supabase
        .from('comments')
        .delete()
        .eq('map_card_id', mapCard.id);

      // Delete the card
      const { error } = await supabase
        .from('map_cards')
        .delete()
        .eq('id', mapCard.id)
        .eq('user_id', user.id);

      if (error) throw error;
      onDelete?.(mapCard.id);
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handleViewStateChange = async (newViewState: any) => {
    if (!isMapActive) return; // Only allow viewstate changes when map is active
    
    setViewState(newViewState);
    
    // Auto-save viewstate changes
    try {
      await supabase
        .from('map_cards')
        .update({ viewstate: newViewState })
        .eq('id', mapCard.id)
        .eq('user_id', user?.id);
    } catch (error) {
      console.error('Error saving viewstate:', error);
    }
  };

  const handleMapDoubleClick = () => {
    setIsMapActive(true);
  };

  const handleMapClick = (e: React.MouseEvent) => {
    // Prevent single clicks from interfering when map is active
    if (isMapActive) {
      e.stopPropagation();
    }
  };

  const handleOutsideClick = () => {
    // Only deactivate when clicking outside the map area
    setIsMapActive(false);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      if (diffInHours < 1) {
        return 'Just now';
      }
      return `Today, ${formatDistanceToNow(date)} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  return (
    <Card className="w-full mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex-1">
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter card title..."
                className="text-lg font-semibold"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') {
                    setEditingTitle(false);
                    setTitle(mapCard.title || '');
                  }
                }}
                autoFocus
              />
              <Button size="sm" onClick={handleSaveTitle}>Save</Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => {
                  setEditingTitle(false);
                  setTitle(mapCard.title || '');
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <CardTitle 
              className="cursor-pointer hover:text-primary transition-colors"
              onClick={() => setEditingTitle(true)}
            >
              {mapCard.title || 'Untitled Map Card'}
            </CardTitle>
          )}
        </div>

        {user?.id === mapCard.user_id && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditingTitle(true)}>
                Edit Title
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDeleteCard}
                className="text-destructive focus:text-destructive"
              >
                Delete Card
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Map Section */}
        <div className="relative">
          <div 
            className={`relative transition-all duration-200 ${
              isMapActive 
                ? 'ring-2 ring-orange-500 rounded-lg' 
                : 'ring-1 ring-border rounded-lg hover:ring-orange-300'
            }`}
            onDoubleClick={handleMapDoubleClick}
            onClick={handleMapClick}
          >
            <LocationMap3D
              locationId={mapCard.location_id}
              viewState={viewState}
              onViewStateChange={handleViewStateChange}
              className="w-full h-[400px] rounded-lg"
              isInteractive={isMapActive}
            />
            {!isMapActive && (
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg backdrop-blur-[1px]"
                onDoubleClick={handleMapDoubleClick}
              >
                <div className="bg-black/60 text-white px-4 py-2 rounded-lg text-sm font-medium pointer-events-none">
                  Double-click to activate map controls
                </div>
              </div>
            )}
            {isMapActive && (
              <button
                onClick={handleOutsideClick}
                className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white rounded-full text-xs font-bold hover:bg-orange-600 transition-colors"
                title="Click to deactivate map"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Comments ({comments.length})</h4>
            {!commentFormVisible && (
              <Button
                onClick={() => setCommentFormVisible(true)}
                size="sm"
                variant="outline"
              >
                <Send className="w-4 h-4 mr-2" />
                Add Comment
              </Button>
            )}
          </div>

          {commentFormVisible && (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium">Add Comment</h5>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCommentFormVisible(false);
                    setNewComment('');
                  }}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
              <TiptapEditor
                content={newComment}
                onChange={setNewComment}
                placeholder="Share your thoughts about this map..."
                className="min-h-[80px]"
                viewState={viewState}
                onViewStateClick={setViewState}
              />
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
                size="sm"
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {comments.map((comment) => (
              <Card key={comment.id} className="bg-background/50 group hover:bg-background/70 transition-colors">
                <CardContent className="p-3 relative">
                  {user?.id === comment.user_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                  
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-card-foreground truncate">
                          {comment.profiles?.display_name || 'Anonymous User'}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {formatRelativeTime(comment.created_at)}
                        </Badge>
                      </div>
                      <CommentRenderer
                        content={comment.content}
                        onViewStateClick={setViewState}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapCard;