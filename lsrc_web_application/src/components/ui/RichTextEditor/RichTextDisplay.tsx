// src/components/ui/RichTextEditor/RichTextDisplay.tsx
import { useMemo } from 'react';
import DOMPurify from 'dompurify';
import './RichTextEditor.css';

// ============================================================
// ALLOWLIST — chỉ những tag/attr an toàn
// ============================================================

/**
 * Tag HTML an toàn.
 * KHÔNG có: script, iframe, object, embed, form, input, style, link, meta, ...
 */
const ALLOWED_TAGS = [
  // Heading
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // Text
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
  'sub', 'sup', 'mark', 'small',
  // Lists
  'ul', 'ol', 'li',
  // Blockquote & code
  'blockquote', 'pre', 'code',
  // Links & media
  'a', 'img', 'figure', 'figcaption',
  // Table
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  // Layout
  'hr', 'div', 'span',
];

/**
 * Attribute an toàn.
 * KHÔNG có: on* (onclick, onerror, ...), formaction, srcdoc, ...
 */
const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'title',
  'src', 'alt', 'width', 'height',
  'class',
  'colspan', 'rowspan',
];

/**
 * Chặn URL có protocol nguy hiểm:
 *  - javascript:
 *  - data: (trừ data:image)
 *  - vbscript:
 *  - file:
 * Cho phép: http, https, mailto, tel, relative URL.
 */
const ALLOWED_URI_REGEXP =
  /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i;

// ============================================================
// PROPS
// ============================================================

type Props = {
  /** Props cũ — giữ để tương thích với caller hiện tại. */
  content?: string;
  /** Props mới — alias cho `content`. */
  html?: string;
  className?: string;
  /** Có dùng Tailwind Prose classes không. Default: true. */
  prose?: boolean;
  /** Fallback khi nội dung rỗng. */
  fallback?: string;
};

// ============================================================
// COMPONENT
// ============================================================

const PROSE_CLASSES = `prose prose-slate max-w-none 
  prose-headings:font-bold 
  prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg 
  prose-p:mb-2 
  prose-ul:list-disc prose-ul:pl-5 
  prose-ol:list-decimal prose-ol:pl-5 
  prose-li:mb-0.5 
  prose-blockquote:border-l-4 prose-blockquote:border-slate-300 
  prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600 
  prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800 
  prose-img:max-w-full prose-img:rounded-lg prose-img:shadow-md 
  prose-pre:bg-slate-100 prose-pre:p-3 prose-pre:rounded-lg 
  prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm 
  prose-table:border-collapse prose-table:w-full 
  prose-th:border prose-th:border-slate-300 prose-th:p-2 prose-th:bg-slate-50 
  prose-td:border prose-td:border-slate-300 prose-td:p-2`;

export function RichTextDisplay({
  content,
  html,
  className = '',
  prose = true,
  fallback = 'Chưa có nội dung',
}: Props) {
  // Hỗ trợ cả `content` (cũ) và `html` (mới) — ưu tiên `content`.
  const rawHtml = content ?? html ?? '';

  // FIXED [PERF]: memo hóa sanitize — không chạy lại mỗi re-render.
  const sanitizedHTML = useMemo(() => {
    if (!rawHtml) return '';
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      ALLOW_DATA_ATTR: false,
      ALLOWED_URI_REGEXP,

      // FIXED [CRITICAL]: chặn hoàn toàn các tag/attr nguy hiểm
      // ngay cả khi chúng lọt vào ALLOWED_TAGS do lỗi cấu hình.
      FORBID_TAGS: [
        'script', 'iframe', 'object', 'embed', 'form',
        'input', 'style', 'link', 'meta', 'base', 'svg', 'math',
      ],
      FORBID_ATTR: [
        'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur',
        'onsubmit', 'onchange', 'oninput', 'onkeydown', 'onkeyup',
        'formaction', 'srcdoc', 'background', 'dynsrc', 'lowsrc',
      ],

      // Force xóa toàn bộ attr bắt đầu bằng "on"
      ALLOW_UNKNOWN_PROTOCOLS: false,
    });
  }, [rawHtml]);

  if (!sanitizedHTML) {
    return <p className="text-slate-400 italic">{fallback}</p>;
  }

  return (
    <div
      className={`rich-text-display ${prose ? PROSE_CLASSES : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
}

export default RichTextDisplay;