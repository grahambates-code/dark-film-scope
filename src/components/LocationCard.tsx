import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Camera, Clock } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  role: string;
  content: string;
  timestamp: string;
  rating?: number;
}

interface LocationDetails {
  name: string;
  address: string;
  type: string;
  size: string;
  availability: string;
  permits: string[];
  parking: string;
  power: string;
  restrictions: string[];
  contact: string;
  dailyRate: string;
}

interface LocationCardProps {
  id: string;
  image: string;
  location: LocationDetails;
  comments: Comment[];
  isActive: boolean;
}

const LocationCard = ({ image, location, comments, isActive }: LocationCardProps) => {
  const [commentsScrolled, setCommentsScrolled] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleCommentsScroll = (scrollTop: number, maxScrollTop: number) => {
    const threshold = 50;
    if (scrollTop > threshold) {
      setCommentsScrolled(true);
    } else if (scrollTop < threshold && commentsScrolled) {
      setCommentsScrolled(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Comments Panel - Left */}
      <div className="w-1/4 scout-surface border-r border-scout-border p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-scout-text mb-2">Location Reviews</h3>
          <div className="flex items-center gap-2 text-sm text-scout-text-muted">
            <Camera className="w-4 h-4" />
            {comments.length} reviews
          </div>
        </div>
        
        <ScrollArea 
          className="h-[calc(100vh-150px)]"
          onScroll={(event) => {
            const target = event.target as HTMLDivElement;
            const maxScrollTop = target.scrollHeight - target.clientHeight;
            handleCommentsScroll(target.scrollTop, maxScrollTop);
          }}
        >
          <div className="space-y-4 pr-4">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium text-scout-text text-sm">{comment.author}</div>
                    <div className="text-xs text-scout-text-muted">{comment.role}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {comment.rating && (
                      <>
                        <Star className="w-3 h-3 fill-scout-secondary text-scout-secondary" />
                        <span className="text-xs text-scout-text-muted">{comment.rating}/5</span>
                      </>
                    )}
                  </div>
                </div>
                
                <p className="text-scout-text text-sm leading-relaxed mb-3">
                  {comment.content}
                </p>
                
                <div className="flex items-center gap-1 text-xs text-scout-text-muted">
                  <Clock className="w-3 h-3" />
                  {comment.timestamp}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Image - Center */}
      <div className="flex-1 relative bg-scout-surface-alt">
        <img 
          src={image} 
          alt={location.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-6 left-6">
          <Badge variant="secondary" className="bg-scout-surface/80 backdrop-blur-sm text-scout-text border-scout-border">
            <MapPin className="w-3 h-3 mr-1" />
            {location.type}
          </Badge>
        </div>
      </div>

      {/* Location Details - Right */}
      <div className="w-1/4 scout-surface border-l border-scout-border p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-scout-text mb-1">{location.name}</h2>
            <p className="text-sm text-scout-text-muted flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {location.address}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-scout-text mb-2">Property Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-scout-text-muted">Size:</span>
                  <span className="text-scout-text">{location.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-scout-text-muted">Daily Rate:</span>
                  <span className="text-scout-text font-semibold">{location.dailyRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-scout-text-muted">Availability:</span>
                  <span className="text-scout-text">{location.availability}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-scout-text mb-2">Filming Infrastructure</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-scout-text-muted">Parking:</span>
                  <span className="text-scout-text">{location.parking}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-scout-text-muted">Power:</span>
                  <span className="text-scout-text">{location.power}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-scout-text mb-2">Permits Required</h4>
              <div className="flex flex-wrap gap-1">
                {location.permits.map((permit, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs border-scout-border-light text-scout-text-muted"
                  >
                    {permit}
                  </Badge>
                ))}
              </div>
            </div>

            {location.restrictions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-scout-text mb-2">Restrictions</h4>
                <ul className="text-xs text-scout-text-muted space-y-1">
                  {location.restrictions.map((restriction, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-scout-secondary">•</span>
                      {restriction}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 border-t border-scout-border">
              <h4 className="text-sm font-semibold text-scout-text mb-1">Location Manager</h4>
              <p className="text-sm text-scout-text-muted">{location.contact}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationCard;