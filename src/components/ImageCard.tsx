import { useState, useEffect } from 'react';
import { Trash2, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ImageCardData {
  id: string;
  location_id: string;
  title: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  images?: string[];
}

interface ImageCardProps {
  mapCard: ImageCardData;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ImageCardData>) => void;
}

const ImageCard = ({ mapCard, onDelete, onUpdate }: ImageCardProps) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(mapCard.title || '');
  const [images, setImages] = useState<string[]>(mapCard.images || []);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setImages(mapCard.images || []);
  }, [mapCard.images]);

  const handleTitleSave = async () => {
    if (!title.trim()) return;
    
    try {
      const { error } = await supabase
        .from('map_cards')
        .update({ title })
        .eq('id', mapCard.id);

      if (error) throw error;
      onUpdate(mapCard.id, { title });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user) return;

    setUploading(true);
    const newImageUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${mapCard.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('location-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('location-images')
          .getPublicUrl(fileName);

        newImageUrls.push(publicUrl);
      }

      const updatedImages = [...images, ...newImageUrls];
      setImages(updatedImages);

      // Save to database
      const { error } = await supabase
        .from('map_cards')
        .update({ images: updatedImages })
        .eq('id', mapCard.id);

      if (error) throw error;
      
      onUpdate(mapCard.id, { images: updatedImages });
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('map_cards')
        .delete()
        .eq('id', mapCard.id);

      if (error) throw error;
      onDelete(mapCard.id);
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handlePrevImage = () => {
    setSelectedImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Card className="w-full aspect-square overflow-hidden">
      <CardContent className="p-0 h-full relative">
        {/* Main Image Display */}
        <div className="relative h-full bg-muted overflow-hidden">
            {images.length > 0 ? (
              <>
                <img
                  src={images[selectedImageIndex]}
                  alt={`${mapCard.title || 'Image'} - ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Title overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Card title"
                        className="bg-white/90"
                      />
                      <Button onClick={handleTitleSave} size="sm">
                        Save
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <h3
                        className="text-lg font-semibold text-white cursor-pointer hover:text-orange-300 transition-colors truncate"
                        onClick={() => setIsEditing(true)}
                      >
                        {mapCard.title || 'Untitled Image Card'}
                      </h3>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-white hover:text-orange-300">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Card</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this image card? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white z-10"
                      onClick={handlePrevImage}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white z-10"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm z-10">
                      {selectedImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No images uploaded yet</p>
                  <label htmlFor={`image-upload-${mapCard.id}`} className="mt-4 inline-block">
                    <Button variant="outline" disabled={uploading} asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? 'Uploading...' : 'Upload Images'}
                      </span>
                    </Button>
                    <input
                      id={`image-upload-${mapCard.id}`}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
      </CardContent>
    </Card>
  );
};

export default ImageCard;