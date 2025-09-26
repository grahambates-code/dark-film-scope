import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const TiptapEditor = ({ content, onChange, placeholder = "Write something...", className }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const text = editor.getHTML();
      onChange(text);
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[80px] px-3 py-2',
          className
        ),
      },
    },
  });

  return (
    <div className={cn(
      "flex min-h-[80px] w-full rounded-md border border-input bg-background text-sm ring-offset-background",
      "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
      className
    )}>
      <EditorContent editor={editor} className="w-full" />
    </div>
  );
};

export default TiptapEditor;