import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

/**
 * Lightweight rich-text editor built on a contentEditable surface.
 * Supports bold / italic / underline, text alignment, and inserting
 * images (by URL) anywhere in the body — including the middle of the text.
 * Content is stored as HTML.
 */
const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Keep the DOM in sync when the value is reset externally (e.g. after submit).
  useEffect(() => {
    const el = editorRef.current;
    if (el && el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [value]);

  const emitChange = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const exec = (command: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    emitChange();
  };

  const insertImage = () => {
    const url = window.prompt("Σύνδεσμος εικόνας (https://...)");
    if (url && url.trim()) {
      exec("insertImage", url.trim());
    }
  };

  const ToolbarButton = ({
    onClick,
    title,
    children,
  }: {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded text-gray-700 hover:bg-orange-50 hover:text-strays-orange"
    >
      {children}
    </button>
  );

  return (
    <div className="rounded-md border border-input bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b border-input p-1">
        <ToolbarButton onClick={() => exec("bold")} title="Έντονα">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("italic")} title="Πλάγια">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("underline")} title="Υπογράμμιση">
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <ToolbarButton onClick={() => exec("justifyLeft")} title="Αριστερά">
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("justifyCenter")} title="Κέντρο">
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("justifyRight")} title="Δεξιά">
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-200" />
        <ToolbarButton onClick={insertImage} title="Εισαγωγή εικόνας">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={emitChange}
        onBlur={emitChange}
        data-placeholder={placeholder}
        className="prose prose-sm min-h-[180px] max-w-none px-3 py-2 text-sm focus:outline-none [&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-md empty:before:text-gray-400 empty:before:content-[attr(data-placeholder)]"
        suppressContentEditableWarning
      />
    </div>
  );
};

export default RichTextEditor;
