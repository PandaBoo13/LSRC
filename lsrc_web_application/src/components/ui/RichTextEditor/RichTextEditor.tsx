// src/components/ui/RichTextEditor/RichTextEditor.tsx
import { useMemo } from 'react';
import ReactQuill from 'react-quill-new';                    // ← ĐỔI
import 'react-quill-new/dist/quill.snow.css';                // ← ĐỔI
import './RichTextEditor.css';

export type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  height?: number | string;
  className?: string;
  toolbar?: 'full' | 'basic' | 'minimal';
};

/**
 * Toolbar config.
 *
 * FIXED [CRITICAL]: Bỏ 'video' khỏi toolbar full vì:
 *   - Video trong Quill dùng iframe → bị RichTextDisplay chặn khi render.
 *   - Tránh user chèn video mà không hiển thị được.
 *   - Nếu cần video, user paste link Youtube dạng <a>.
 */
const TOOLBAR_CONFIG = {
  full: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean'],
  ],
  basic: [
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'clean'],
  ],
  minimal: [
    ['bold', 'italic', 'underline'],
    ['clean'],
  ],
};

const FORMATS = {
  full: [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align',
    'list', 'bullet',
    'blockquote', 'code-block',
    'link', 'image',
  ],
  basic: ['bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link'],
  minimal: ['bold', 'italic', 'underline'],
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Nhập nội dung...',
  readOnly = false,
  height = 400,
  className = '',
  toolbar = 'full',
}: RichTextEditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: TOOLBAR_CONFIG[toolbar],
    }),
    [toolbar]
  );

  const formats = FORMATS[toolbar];

  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      />
    </div>
  );
}

export default RichTextEditor;