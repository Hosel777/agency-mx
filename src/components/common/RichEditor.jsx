import { useState, useRef, useCallback } from 'react'

const TOOLBAR = [
  { cmd: 'bold', icon: 'B', label: 'Negrita' },
  { cmd: 'italic', icon: 'I', label: 'Cursiva', style: 'font-style:italic' },
  { cmd: 'underline', icon: 'U', label: 'Subrayado', style: 'text-decoration:underline' },
  { type: 'sep' },
  { cmd: 'insertUnorderedList', icon: '•', label: 'Lista' },
  { cmd: 'insertOrderedList', icon: '1.', label: 'Lista ordenada' },
  { type: 'sep' },
  { cmd: 'formatBlock', arg: 'h3', icon: 'H', label: 'Título' },
  { cmd: 'formatBlock', arg: 'p', icon: '¶', label: 'Párrafo' },
]

export default function RichEditor({ value, onChange, placeholder = 'Escribe aquí...', minHeight = 200 }) {
  const editorRef = useRef(null)
  const [isFocused, setIsFocused] = useState(false)

  const exec = useCallback((cmd, arg) => {
    document.execCommand(cmd, false, arg)
    editorRef.current?.focus()
    if (onChange) onChange(editorRef.current?.innerHTML || '')
  }, [onChange])

  const handleInput = useCallback(() => {
    if (onChange) onChange(editorRef.current?.innerHTML || '')
  }, [onChange])

  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${isFocused ? 'border-primary ring-2 ring-primary/30' : 'border-outline-variant'}`}>
      <div className="flex items-center gap-1 px-2 py-1.5 bg-surface-container-low border-b border-outline-variant/20 flex-wrap">
        {TOOLBAR.map((item, i) =>
          item.type === 'sep' ? (
            <div key={i} className="w-px h-5 bg-outline-variant/30 mx-1" />
          ) : (
            <button
              key={i}
              type="button"
              onMouseDown={e => { e.preventDefault(); exec(item.cmd, item.arg) }}
              className="px-2 py-1 rounded text-body-md text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all font-medium"
              title={item.label}
              style={item.style ? { fontStyle: 'italic' } : undefined}
            >
              {item.icon}
            </button>
          )
        )}
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        dangerouslySetInnerHTML={{ __html: value }}
        className="p-4 bg-surface text-body-md text-on-surface outline-none overflow-auto"
        style={{ minHeight }}
        data-placeholder={placeholder}
      />
      <style>{`
        [contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: var(--color-outline);
          opacity: 0.5;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
