import { useState, useRef } from 'react'
import { Upload, X, File, Loader2 } from 'lucide-react'
import { uploadFile } from '../../services/storage'

export default function FileUpload({ onUpload, path = '', accept = '*', multiple = false }) {
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState([])
  const inputRef = useRef(null)

  const handleSelect = (e) => {
    const selected = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selected.map(f => ({ file: f, name: f.name, size: f.size, status: 'pending' }))])
    e.target.value = ''
  }

  const handleUpload = async (index) => {
    const item = files[index]
    if (!item || item.status === 'uploading') return

    setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'uploading' } : f))
    setUploading(true)

    try {
      const result = await uploadFile(item.file, path)
      setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'done', url: result.url, path: result.path } : f))
      if (onUpload) onUpload(result)
    } catch (err) {
      setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'error' } : f))
    }

    setUploading(false)
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-outline-variant/40 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
      >
        <Upload className="w-8 h-8 mx-auto text-on-surface-variant/40 mb-2" />
        <p className="text-body-md text-on-surface-variant">Arrastra archivos o haz clic para seleccionar</p>
        <p className="text-caption text-on-surface-variant/60 mt-1">Los archivos se almacenan en Supabase Storage</p>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleSelect}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-1">
          {files.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-surface-container-low rounded-lg text-body-md border border-outline-variant/10">
              <div className="flex items-center gap-2 min-w-0">
                <File className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
                <span className="truncate text-on-surface">{item.name}</span>
                <span className="text-caption text-on-surface-variant">({(item.size / 1024).toFixed(1)} KB)</span>
              </div>
              <div className="flex items-center gap-1">
                {item.status === 'pending' && (
                  <button onClick={() => handleUpload(i)} disabled={uploading} className="text-primary hover:text-primary/80 text-caption font-medium px-2 py-1">
                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Subir'}
                  </button>
                )}
                {item.status === 'uploading' && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                {item.status === 'done' && <span className="text-caption text-tertiary">✓</span>}
                {item.status === 'error' && <span className="text-caption text-error">Error</span>}
                <button onClick={() => removeFile(i)} className="p-1 hover:bg-surface-container-hover rounded transition-colors">
                  <X className="w-3 h-3 text-on-surface-variant" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
