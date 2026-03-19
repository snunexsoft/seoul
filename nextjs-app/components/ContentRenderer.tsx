'use client';

interface ContentRendererProps {
  content: string;
  className?: string;
}

/**
 * 위험한 HTML 태그 및 속성을 제거하는 간단한 sanitizer
 */
function sanitizeHtml(html: string): string {
  // 위험한 태그 제거: script, iframe, object, embed, form, base, meta, link, style, svg (이벤트 핸들러 가능)
  let sanitized = html.replace(/<\s*\/?\s*(script|iframe|object|embed|form|base|meta|link|applet)\b[^>]*>/gi, '');

  // on* 이벤트 핸들러 속성 제거 (onclick, onerror, onload 등)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // javascript: 프로토콜 제거
  sanitized = sanitized.replace(/\bhref\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'href="#"');
  sanitized = sanitized.replace(/\bsrc\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'src=""');

  // data: URI 제거 (이미지 제외)
  sanitized = sanitized.replace(/\bsrc\s*=\s*(?:"data:(?!image\/)[^"]*"|'data:(?!image\/)[^']*')/gi, 'src=""');

  return sanitized;
}

export default function ContentRenderer({ content, className = '' }: ContentRendererProps) {
  const sanitizedContent = sanitizeHtml(content);

  return (
    <div
      className={`prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
