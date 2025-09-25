import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
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
  images: string[];
  location: LocationDetails;
  comments: Comment[];
  isActive: boolean;
}
const LocationCard = ({
  images,
  location,
  comments,
  isActive
}: LocationCardProps) => {
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
  return <div className="relative">
    <Card className="bg-scout-surface border-scout-border shadow-lg overflow-hidden">
      {/* Location Header with Key Details */}
      <div className="bg-scout-surface-alt border-b border-scout-border p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-scout-text">{location.name}</h1>
          <p className="text-scout-text-muted flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {location.address}
          </p>
        </div>
        
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-scout-text-muted">Size:</span>
            <span className="text-scout-text font-medium">{location.size}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-scout-text-muted">Daily Rate:</span>
            <span className="text-scout-text font-semibold">{location.dailyRate}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-scout-text-muted">Permits:</span>
            <div className="flex flex-wrap gap-1">
              {location.permits.slice(0, 3).map((permit, index) => <Badge key={index} variant="outline" className="text-xs border-scout-border-light text-scout-text-muted">
                  {permit}
                </Badge>)}
              {location.permits.length > 3 && <Badge variant="outline" className="text-xs border-scout-border-light text-scout-text-muted">
                  +{location.permits.length - 3} more
                </Badge>}
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative h-[600px]">
        {/* Main Image Carousel - Background */}
        <div className="absolute inset-0 bg-scout-surface-alt flex items-center justify-center pl-[50%]">
          <div className="w-full h-full aspect-square">
            <Carousel className="w-full h-full">
              <CarouselContent>
                {images.map((image, index) => <CarouselItem key={index}>
                    <div className="aspect-square w-full">
                      <img src={image} alt={`${location.name} - View ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  </CarouselItem>)}
              </CarouselContent>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-scout-surface/80 border-scout-border hover:bg-scout-surface-alt z-10" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-scout-surface/80 border-scout-border hover:bg-scout-surface-alt z-10" />
            </Carousel>
          </div>
        </div>

        {/* Comments Panel - Bleeding Out */}
        <div className="absolute -left-16 top-0 bottom-0 w-[60%] bg-transparent border border-scout-border/50 rounded-lg p-6 z-30 shadow-2xl">
          
          
          <ScrollArea className="h-[calc(100%-60px)]" onScroll={event => {
          const target = event.target as HTMLDivElement;
          const maxScrollTop = target.scrollHeight - target.clientHeight;
          handleCommentsScroll(target.scrollTop, maxScrollTop);
        }}>
            <div className="space-y-4 pr-2">
              {comments.map(comment => <div key={comment.id} className="comment-card bg-scout-surface/90 border border-scout-border/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium text-scout-text text-xl">{comment.author}</div>
                      <div className="text-sm text-scout-text-muted">{comment.role}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {comment.rating && <>
                          <Star className="w-4 h-4 fill-scout-secondary text-scout-secondary" />
                          <span className="text-sm text-scout-text-muted">{comment.rating}/5</span>
                        </>}
                    </div>
                  </div>
                  
                  <p className="text-scout-text text-xl leading-relaxed mb-3">
                    {comment.content}
                  </p>
                  
                  <div className="flex items-center gap-1 text-sm text-scout-text-muted">
                    <Clock className="w-4 h-4" />
                    {comment.timestamp}
                  </div>
                </div>)}
            </div>
          </ScrollArea>
        </div>
      </div>
    </Card>
  </div>;
};
export default LocationCard;