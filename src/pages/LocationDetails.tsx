import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation, MessageCircle, Send, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import AuthForm from '@/components/AuthForm';

interface Location {
  id: string;
  production_id: string;
  name: string;
  address: string;
  description: string;
  latitude: number;
  longitude: number;
}

interface Production {
  id: string;
  title: string;
  type: string;
  year: number;
  description: string;
}

interface Comment {
  id: string;
  content: string;
  author: string;
  created_at: string;
}

const LocationDetails = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [location, setLocation] = useState<Location | null>(null);
  const [production, setProduction] = useState<Production | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentsExpanded, setCommentsExpanded] = useState(false);

  // Mock image for now - you can replace with actual location images
  const getLocationImage = (locationName: string) => {
    // Using picsum for placeholder images based on location name
    const seed = locationName.toLowerCase().replace(/\s+/g, '-');
    return `https://picsum.photos/seed/${seed}/800/600`;
  };

  useEffect(() => {
    if (locationId) {
      fetchLocationDetails(locationId);
    }
  }, [locationId]);

  const fetchLocationDetails = async (locId: string) => {
    try {
      setLoading(true);
      
      // Fetch location details
      const { data: locationData, error: locationError } = await supabase
        .from('locations')
        .select('*')
        .eq('id', locId)
        .single();

      if (locationError) throw locationError;
      setLocation(locationData);

      // Fetch production details
      if (locationData.production_id) {
        const { data: productionData, error: productionError } = await supabase
          .from('productions')
          .select('*')
          .eq('id', locationData.production_id)
          .single();

        if (productionError) throw productionError;
        setProduction(productionData);
      }

      // Fetch real comments from database
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('location_id', locId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;
      setComments(commentsData || []);

    } catch (error) {
      console.error('Error fetching location details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user || !locationId) return;

    setSubmitting(true);
    try {
      // Insert comment into database
      const { data, error } = await supabase
        .from('comments')
        .insert({
          location_id: locationId,
          content: newComment.trim(),
          author: user.email || 'Anonymous User'
        })
        .select()
        .single();

      if (error) throw error;

      // Add the new comment to the top of the list
      setComments(prev => [data, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openInMaps = () => {
    if (location?.latitude && location?.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
      window.open(url, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-scout-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={() => {}} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-scout-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading location details...</p>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Location not found</h2>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-scout-surface/95 backdrop-blur-sm border-b border-scout-border p-4">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => navigate('/')} 
            variant="ghost" 
            size="sm"
            className="text-scout-text hover:bg-scout-surface-alt"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-scout-primary">{location.name}</h1>
            {production && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {production.title}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {production.type.replace('tv_show', 'TV Show').replace('_', ' ')}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Comments Sidebar - Left */}
        <div className={`${commentsExpanded ? 'w-1/2' : 'w-80'} bg-card border-r border-scout-border flex flex-col transition-all duration-300`}>
          <div className="p-4 border-b border-scout-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-scout-primary" />
                <h2 className="font-semibold text-card-foreground">Comments ({comments.length})</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCommentsExpanded(!commentsExpanded)}
                className="h-8 w-8 p-0"
              >
                {commentsExpanded ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {/* New Comment Form */}
            <div className="space-y-3">
              <Textarea
                placeholder="Share your thoughts about this location..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
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
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id} className="bg-background/50">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-card-foreground truncate">
                          {comment.author}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content - Center */}
        <div className="flex-1 flex flex-col">
          {/* Location Image */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-4xl w-full">
              <img
                src={getLocationImage(location.name)}
                alt={location.name}
                className="w-full h-[500px] object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://picsum.photos/800/600?grayscale';
                }}
              />
            </div>
          </div>

          {/* Location Details - Bottom */}
          <div className="p-6 border-t border-scout-border bg-card">
            <div className="max-w-4xl">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-card-foreground mb-3">Location Details</h3>
                  <div className="space-y-2 text-sm">
                    {location.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{location.address}</span>
                      </div>
                    )}
                    {location.description && (
                      <p className="text-card-foreground mt-3">{location.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-end justify-end">
                  {location.latitude && location.longitude && (
                    <Button onClick={openInMaps} variant="outline" className="gap-2">
                      <Navigation className="w-4 h-4" />
                      View on Map
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetails;