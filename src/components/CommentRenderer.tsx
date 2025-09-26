import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ViewState } from './tiptap/ViewStateExtension';

interface CommentRendererProps {
  content: string;
  onViewStateClick?: (viewState: any) => void;
}

const CommentRenderer: React.FC<CommentRendererProps> = ({ 
  content, 
  onViewStateClick 
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ViewState.configure({
        HTMLAttributes: {
          class: 'viewstate-mark bg-blue-100 text-blue-800 px-1 rounded cursor-pointer hover:bg-blue-200 transition-colors',
        },
      }),
    ],
    content,
    editable: false, // Read-only mode
    editorProps: {
      attributes: {
        class: 'text-sm text-muted-foreground prose prose-sm max-w-none focus:outline-none',
      },
      handleClickOn: (view, pos, node, nodePos, event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('viewstate-mark')) {
          const viewStateData = target.getAttribute('data-viewstate');
          if (viewStateData && onViewStateClick) {
            try {
              const viewState = JSON.parse(viewStateData);
              onViewStateClick(viewState);
            } catch (error) {
              console.error('Error parsing view state:', error);
            }
          }
        }
        return false;
      },
    },
  });

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} />;
};

export default CommentRenderer;