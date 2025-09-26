import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Undo, Redo, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ViewState } from './tiptap/ViewStateExtension';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  viewState?: any;
}

const TiptapEditor = ({ content, onChange, placeholder = "Write something...", className = "", viewState }: TiptapEditorProps) => {
  const [hasSelection, setHasSelection] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      ViewState,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      setHasSelection(!editor.state.selection.empty);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[60px] p-3',
      },
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement;
        if (target.hasAttribute('data-viewstate')) {
          const viewStateStr = target.getAttribute('data-viewstate');
          if (viewStateStr) {
            const viewStateData = JSON.parse(viewStateStr);
            alert(`Camera Position:\nLongitude: ${viewStateData.longitude}\nLatitude: ${viewStateData.latitude}\nZoom: ${viewStateData.zoom}\nPitch: ${viewStateData.pitch}\nBearing: ${viewStateData.bearing}`);
          }
        }
        return false;
      },
    },
  });

  // Update selection state when editor is available
  useEffect(() => {
    if (editor) {
      setHasSelection(!editor.state.selection.empty);
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn(
      "flex flex-col min-h-[120px] w-full rounded-md border border-input bg-background text-sm ring-offset-background",
      "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
      className
    )}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('bold') ? 'bg-muted' : ''
          )}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('italic') ? 'bg-muted' : ''
          )}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('bulletList') ? 'bg-muted' : ''
          )}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('orderedList') ? 'bg-muted' : ''
          )}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
        
        {/* Separator */}
        <div className="w-px h-4 bg-border mx-1" />
        
        {/* ViewState capture button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            if (viewState && hasSelection) {
              const { from, to } = editor.state.selection;
              editor.chain()
                .focus()
                .setViewState(viewState)
                .setTextSelection(to) // Move cursor to end of selection
                .unsetViewState() // Unset the mark for future content
                .insertContent(' ') // Insert a normal space outside the mark
                .run();
            }
          }}
          disabled={!viewState || !hasSelection}
          className={cn(
            "h-8 w-8 p-0",
            editor.isActive('viewState') ? 'bg-muted' : ''
          )}
          title="Capture camera position for selected text"
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Editor */}
      <EditorContent editor={editor} className="flex-1" />
    </div>
  );
};

export default TiptapEditor;