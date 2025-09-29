import { useState } from 'react';
import { Trash2, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
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
  const [images, setImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

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

        const { error: uploadError, data } = await supabase.storage
          .from('location-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('location-images')
          .getPublicUrl(fileName);

        newImageUrls.push(publicUrl);
      }

      setImages(prev => [...prev, ...newImageUrls]);
    } catch (error) {
      console.error('Error uploading images:', error);
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
    <Card className="w-full shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex-1">
          {isEditing ? (
            <div className="flex gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Card title"
                className="max-w-md"
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
            <h3
              className="text-xl font-semibold cursor-pointer hover:text-primary"
              onClick={() => setIsEditing(true)}
            >
              {mapCard.title || 'Untitled Image Card'}
            </h3>
          )}
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Trash2 className="w-4 h-4 text-destructive" />
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
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Main Image Display */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {images.length > 0 ? (
              <>
                <img
                  src={images[selectedImageIndex]}
                  alt={`${mapCard.title || 'Image'} - ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={handlePrevImage}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
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
                </div>
              </div>
            )}
          </div>

          {/* Image Carousel Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-orange-500 ring-2 ring-orange-200'
                      : 'border-transparent hover:border-orange-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-center">
            <label htmlFor={`image-upload-${mapCard.id}`}>
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
      </CardContent>
    </Card>
  );
};

export default ImageCard;