import { Film, ArrowLeft, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";


interface AppHeaderProps {
  variant?: 'home' | 'location';
  locationName?: string;
  production?: {
    title: string;
    type: string;
  };
  className?: string;
}

export function AppHeader({ variant = 'home', locationName, production, className }: AppHeaderProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const AccountDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 h-auto px-2 py-1">
          <User className="w-4 h-4" />
          <span className="text-sm">{user?.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={5} className="w-56 bg-background border border-border shadow-lg z-[100]">
        <DropdownMenuItem disabled className="cursor-default opacity-50">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive hover:bg-destructive/10">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (variant === 'home') {
    return (
      <header className={`fixed top-0 left-0 right-0 z-50 bg-scout-surface/95 backdrop-blur-sm border-b border-scout-border ${className || ''}`}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Film className="w-6 h-6 text-scout-primary" />
            <h1 className="text-lg font-bold text-scout-primary">FilmScout Pro</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <AccountDropdown />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`bg-scout-surface/95 backdrop-blur-sm border-b border-scout-border p-4 ${className || ''}`}>
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="text-scout-text hover:bg-scout-surface-alt">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          {production && (
            <h1 className="text-xl font-bold text-scout-primary">{production.title}</h1>
          )}
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {locationName}
            </Badge>
            {production && (
              <Badge variant="outline" className="text-xs">
                {production.type.replace('tv_show', 'TV Show').replace('_', ' ')}
              </Badge>
            )}
          </div>
        </div>
        
        <AccountDropdown />
      </div>
    </header>
  );
}