import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Film, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <Film className="w-16 h-16 text-scout-primary" />
        </div>
        <h1 className="text-6xl font-bold text-scout-text">404</h1>
        <div className="space-y-2">
          <p className="text-xl text-scout-text">Location Not Found</p>
          <p className="text-scout-text-muted">This filming location doesn't exist in our database</p>
        </div>
        <Button 
          asChild 
          className="bg-scout-primary hover:bg-scout-primary/90 text-scout-surface"
        >
          <a href="/" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Return to Locations
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
