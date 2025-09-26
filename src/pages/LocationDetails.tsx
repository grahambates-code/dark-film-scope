import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation, MessageCircle, Send, User, ChevronLeft, ChevronRight, Trash2, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import AuthForm from '@/components/AuthForm';
import TiptapEditor from '@/components/TiptapEditor';
import CommentRenderer from '@/components/CommentRenderer';
import LocationMap3D from '@/components/LocationMap3D';
import { AppHeader } from '@/components/AppHeader';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Import location images
import location1 from '@/assets/location1.jpg';
import location1_2 from '@/assets/location1-2.jpg';
import location1_3 from '@/assets/location1-3.jpg';
import location2 from '@/assets/location2.jpg';
import location2_2 from '@/assets/location2-2.jpg';
import location2_3 from '@/assets/location2-3.jpg';
import location3 from '@/assets/location3.jpg';
import location3_2 from '@/assets/location3-2.jpg';
import location3_3 from '@/assets/location3-3.jpg';
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
  user_id: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
  };
}
const LocationDetails = () => {
  const {
    locationId
  } = useParams<{
    locationId: string;
  }>();
  const navigate = useNavigate();
  const {
    user,
    loading: authLoading
  } = useAuth();
  const [location, setLocation] = useState<Location | null>(null);
  const [production, setProduction] = useState<Production | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [cameraPosition, setCameraPosition] = useState<any>(null);
  const [viewState, setViewState] = useState<any>({
    longitude: -74.0060,
    latitude: 40.7128,
    zoom: 15,
    pitch: 0,
    bearing: 0
  });
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [commentFormVisible, setCommentFormVisible] = useState(false);

  // Get location images based on location name
  const getLocationImages = (locationName: string): string[] => {
    // Map location names to their image arrays
    const imageMap: { [key: string]: string[] } = {
      'location1': [location1, location1_2, location1_3],
      'location2': [location2, location2_2, location2_3], 
      'location3': [location3, location3_2, location3_3]
    };
    
    // Try to match by location name (case insensitive)
    const normalizedName = locationName.toLowerCase().replace(/\s+/g, '');
    
    // Check for partial matches
    for (const [key, images] of Object.entries(imageMap)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return images;
      }
    }
    
    // Fallback to location1 images or generate placeholder images
    return imageMap.location1 || [
      `https://picsum.photos/seed/${locationName}-1/800/600`,
      `https://picsum.photos/seed/${locationName}-2/800/600`, 
      `https://picsum.photos/seed/${locationName}-3/800/600`
    ];
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
      const {
        data: locationData,
        error: locationError
      } = await supabase.from('locations').select('*').eq('id', locId).single();
      if (locationError) throw locationError;
      setLocation(locationData);

      // Fetch production details
      if (locationData.production_id) {
        const {
          data: productionData,
          error: productionError
        } = await supabase.from('productions').select('*').eq('id', locationData.production_id).single();
        if (productionError) throw productionError;
        setProduction(productionData);
      }

      // Fetch comments for this location with profile data
      const {
        data: commentsData,
        error: commentsError
      } = await supabase.from('comments').select(`
        *,
        profiles!comments_user_id_fkey(display_name)
      `).eq('location_id', locId).order('created_at', {
        ascending: false
      });
      if (commentsError) throw commentsError;
      setComments(commentsData || []);

      // Fetch camera position
      const {
        data: cameraData,
        error: cameraError
      } = await supabase.from('location_camera_position').select('*').eq('location_id', locId).single();
      if (cameraError) {
        console.error('Error fetching camera position:', cameraError);
      } else {
        setCameraPosition(cameraData?.viewstate);
        if (cameraData?.viewstate) {
          setViewState(cameraData.viewstate);
        }
      }
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
      // Insert comment into database with HTML content
      const {
        data,
        error
      } = await supabase.from('comments').insert({
        location_id: locationId,
        content: newComment,
        user_id: user.id
      }).select(`
        *,
        profiles!comments_user_id_fkey(display_name)
      `).single();
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

  const handleDeleteComment = async (commentId: string) => {
    try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id);
      
      if (error) throw error;

      // Remove the comment from the local state
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };
  const openInMaps = () => {
    if (location?.latitude && location?.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
      window.open(url, '_blank');
    }
  };
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      // Same day
      if (diffInHours < 1) {
        return 'Just now';
      }
      return `Today, ${formatDistanceToNow(date)} ago`;
    } else if (diffInHours < 48) {
      // Yesterday
      return 'Yesterday';
    } else {
      // More than a day ago
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };
  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-scout-primary"></div>
      </div>;
  }
  if (!user) {
    return <AuthForm onAuthSuccess={() => {}} />;
  }
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-scout-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading location details...</p>
        </div>
      </div>;
  }
  if (!location) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Location not found</h2>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader 
        variant="location" 
        locationName={location.name} 
        production={production} 
      />

      <div className="flex h-[calc(100vh-73px)]">
        {/* Comments Sidebar - Left */}
        <div className={`${commentsExpanded ? 'w-1/2' : 'w-80'} bg-card border-r border-scout-border flex flex-col transition-all duration-300 relative`}>
          {/* Toggle Button - Absolutely positioned on right margin */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCommentsExpanded(!commentsExpanded)} 
            className="absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-card border border-scout-border shadow-sm z-10 hover:bg-scout-surface-alt"
          >
            {commentsExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
          
          {/* Add Comment Button - Top Right */}
          {!commentFormVisible && (
            <Button 
              onClick={() => setCommentFormVisible(true)}
              size="sm"
              className="absolute top-4 right-4 rounded-full h-10 w-10 p-0 z-20"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
          
          <div className="p-4 border-b border-scout-border">
            {commentFormVisible && (
              // Expanded Comment Form
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-card-foreground">Add Comment</h3>
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
                  placeholder="Share your thoughts about this location..." 
                  className="min-h-[80px]"
                  viewState={viewState}
                  onViewStateClick={(viewState) => setViewState(viewState)}
                />
                <Button onClick={handleSubmitComment} disabled={!newComment.trim() || submitting} size="sm" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            )}
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.map(comment => <Card key={comment.id} className="bg-background/50 group hover:bg-background/70 transition-colors">
                <CardContent className="p-3 relative">
                  {/* Delete button - only show on hover and if user owns the comment */}
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
                  
                  <div className="flex items-start gap-2 mb-2">
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
                        onViewStateClick={(viewState) => {
                          setViewState(viewState);
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>

        {/* Main Content - Center */}
        <div className="flex-1 flex flex-col">
          {/* Location Carousel - Map + Images */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-4xl w-full">
              <Carousel 
                className="w-full"
                opts={{
                  watchDrag: false
                }}
              >
                <CarouselContent>
                  {/* First item: 3D Map */}
                  <CarouselItem>
                    <div className="relative">
                      <LocationMap3D 
                        locationId={locationId!}
                        viewState={viewState}
                        onViewStateChange={setViewState}
                        className="w-full h-[500px]"
                      />
                      {/* Map indicator */}
                      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        Map / {getLocationImages(location.name).length + 1}
                      </div>
                    </div>
                  </CarouselItem>
                  
                  {/* Remaining items: Images */}
                  {getLocationImages(location.name).map((imageSrc, index) => (
                    <CarouselItem key={index}>
                      <div className="relative">
                        <img 
                          src={imageSrc} 
                          alt={`${location.name} - Image ${index + 1}`}
                          className="w-full h-[500px] object-cover rounded-lg shadow-lg" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://picsum.photos/800/600?grayscale';
                          }} 
                        />
                        {/* Image counter */}
                        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {index + 2} / {getLocationImages(location.name).length + 1}
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            </div>
          </div>

          {/* Location Details - Bottom */}
          <div className="p-6 border-t border-scout-border bg-card">
            <div className="max-w-4xl">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-card-foreground mb-3">Location Details</h3>
                  <div className="space-y-2 text-sm">
                    {location.address && <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{location.address}</span>
                      </div>}
                    {location.description && <p className="text-card-foreground mt-3">{location.description}</p>}
                  </div>
                </div>

                <div className="flex items-end justify-end">
                  {location.latitude && location.longitude && <Button onClick={openInMaps} variant="outline" className="gap-2">
                      <Navigation className="w-4 h-4" />
                      View on Map
                    </Button>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default LocationDetails;