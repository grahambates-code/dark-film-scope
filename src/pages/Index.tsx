import { useState, useEffect } from 'react';
import { ChevronDown, Film, Search, Filter } from 'lucide-react';
import LocationCard from '@/components/LocationCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import location1 from '@/assets/location1.jpg';
import location1_2 from '@/assets/location1-2.jpg';
import location1_3 from '@/assets/location1-3.jpg';
import location2 from '@/assets/location2.jpg';
import location2_2 from '@/assets/location2-2.jpg';
import location2_3 from '@/assets/location2-3.jpg';
import location3 from '@/assets/location3.jpg';
import location3_2 from '@/assets/location3-2.jpg';
import location3_3 from '@/assets/location3-3.jpg';
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
interface Location {
  id: string;
  images: string[];
  location: LocationDetails;
  comments: Comment[];
}
const mockLocations: Location[] = [{
  id: '1',
  images: [location1, location1_2, location1_3],
  location: {
    name: 'Downtown Financial District',
    address: '425 Market Street, San Francisco, CA',
    type: 'Urban Commercial',
    size: '2.5 acres',
    availability: 'Available weekdays',
    permits: ['City Film Permit', 'Street Closure', 'Drone Authorization'],
    parking: '50+ spaces nearby',
    power: '120V/240V available',
    restrictions: ['No night filming after 10PM', 'Limited crane access', 'Noise restrictions in effect'],
    contact: 'Sarah Mitchell - (415) 555-0123',
    dailyRate: '$2,500/day'
  },
  comments: [{
    id: '1',
    author: 'Marcus Rodriguez',
    role: 'Director of Photography',
    content: 'Excellent natural lighting throughout the day. The glass facades create beautiful reflections during golden hour. Street access is convenient for equipment trucks. Some traffic noise but manageable with proper sound equipment.',
    timestamp: '2 days ago',
    rating: 5
  }, {
    id: '2',
    author: 'Jennifer Chen',
    role: 'Location Scout',
    content: 'Perfect for corporate/financial scenes. Multiple angle options available. Parking situation is good but gets crowded during lunch hours. Building management is very cooperative with film crews.',
    timestamp: '1 week ago',
    rating: 4
  }, {
    id: '3',
    author: 'David Thompson',
    role: 'Production Manager',
    content: 'Great infrastructure for large productions. Easy equipment access via loading docks. Power supply is reliable. Consider traffic patterns when scheduling - morning rush can be challenging for crew movement.',
    timestamp: '2 weeks ago',
    rating: 4
  }]
}, {
  id: '2',
  images: [location2, location2_2, location2_3],
  location: {
    name: 'Industrial Warehouse Complex',
    address: '1847 Industrial Blvd, Oakland, CA',
    type: 'Industrial/Warehouse',
    size: '4.2 acres',
    availability: 'Flexible scheduling',
    permits: ['Industrial Film Permit', 'Fire Safety Clearance'],
    parking: '100+ spaces on-site',
    power: '480V industrial power',
    restrictions: ['Safety equipment required', 'No open flames'],
    contact: 'Robert Kim - (510) 555-0198',
    dailyRate: '$1,800/day'
  },
  comments: [{
    id: '4',
    author: 'Lisa Park',
    role: 'Art Director',
    content: 'Incredible atmospheric potential. The brick textures and industrial architecture provide authentic gritty aesthetics. Multiple buildings offer variety within single location. Some areas need cleaning but overall fantastic for period pieces.',
    timestamp: '3 days ago',
    rating: 5
  }, {
    id: '5',
    author: 'Carlos Mendez',
    role: 'Cinematographer',
    content: 'Love the natural weathering and patina on the buildings. Great for dramatic lighting setups. High ceilings accommodate large lighting rigs. Be aware of some areas with asbestos - check with location manager first.',
    timestamp: '5 days ago',
    rating: 4
  }, {
    id: '6',
    author: 'Amanda Foster',
    role: 'Producer',
    content: 'Excellent value for money. Spacious enough for complex set builds. Loading dock access is perfect for equipment trucks. Owner is experienced with film productions and very accommodating.',
    timestamp: '1 week ago',
    rating: 5
  }, {
    id: '7',
    author: 'Mike Sullivan',
    role: 'Gaffer',
    content: 'Industrial power infrastructure is a huge plus. Multiple electrical panels available. Some rewiring needed for specific setups but nothing major. Great for scenes requiring authentic industrial feel.',
    timestamp: '1 week ago',
    rating: 4
  }]
}, {
  id: '3',
  images: [location3, location3_2, location3_3],
  location: {
    name: 'Victorian Village District',
    address: '2156 Sacramento Street, San Francisco, CA',
    type: 'Historic Residential',
    size: '1.8 acres',
    availability: 'Weekends preferred',
    permits: ['Residential Film Permit', 'Historic District Clearance', 'Neighborhood Notice'],
    parking: 'Street parking only',
    power: '120V residential',
    restrictions: ['Quiet hours 8PM-8AM', 'No heavy equipment', 'Resident access required'],
    contact: 'Eleanor Price - (415) 555-0167',
    dailyRate: '$1,200/day'
  },
  comments: [{
    id: '8',
    author: 'Thomas Wright',
    role: 'Director',
    content: 'Perfect for period dramas and romantic comedies. The Victorian architecture is beautifully preserved. Tree-lined streets create natural frames. Residents are generally cooperative but require advance notice.',
    timestamp: '1 day ago',
    rating: 5
  }, {
    id: '9',
    author: 'Rachel Green',
    role: 'Location Manager',
    content: 'Charming neighborhood with excellent visual appeal. Multiple house styles available on same block. Parking is limited - plan for shuttle service from remote parking area. Historic commission approval required for any modifications.',
    timestamp: '4 days ago',
    rating: 4
  }, {
    id: '10',
    author: 'Kevin Martinez',
    role: 'Sound Engineer',
    content: 'Generally quiet neighborhood perfect for dialogue scenes. Some aircraft noise from nearby corridor. Morning shoots recommended - less traffic and neighbor activity. Beautiful natural acoustics.',
    timestamp: '6 days ago',
    rating: 4
  }]
}];
const Index = () => {
  const [currentLocation, setCurrentLocation] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter locations based on search query
  const filteredLocations = mockLocations.filter(location => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      location.location.name.toLowerCase().includes(query) ||
      location.location.address.toLowerCase().includes(query) ||
      location.location.type.toLowerCase().includes(query) ||
      location.comments.some(comment => 
        comment.content.toLowerCase().includes(query) ||
        comment.author.toLowerCase().includes(query)
      )
    );
  });
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      const locationHeight = window.innerHeight;
      const newLocation = Math.floor(window.scrollY / locationHeight);
      setCurrentLocation(Math.min(newLocation, filteredLocations.length - 1));
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredLocations.length]);
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-scout-surface/95 backdrop-blur-sm border-b border-scout-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Film className="w-6 h-6 text-scout-primary" />
            <h1 className="text-lg font-bold text-scout-text">FilmScout Pro</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-scout-text-muted" />
              <Input 
                placeholder="Search locations..." 
                className="pl-10 w-64 bg-scout-surface border-scout-border text-scout-text placeholder:text-scout-text-muted"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="border-scout-border text-scout-text hover:bg-scout-surface-alt">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </header>

      {/* Location Navigation Indicator */}
      <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40">
        
      </div>

      {/* Locations */}
      <div className="pt-[73px] space-y-8 p-8">
        {filteredLocations.map((location, index) => 
          <div key={location.id} className="min-h-[700px]">
            <LocationCard 
              id={location.id} 
              images={location.images} 
              location={location.location} 
              comments={location.comments} 
              isActive={currentLocation === index} 
            />
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        {currentLocation < filteredLocations.length - 1 && (
          <div className="flex flex-col items-center text-scout-text-muted animate-bounce">
            <span className="text-xs mb-1">Scroll for next location</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>;
};
export default Index;