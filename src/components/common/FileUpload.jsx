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
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-agency-400 hover:bg-agency-50/50 transition-colors"
      >
        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">Arrastra archivos o haz clic para seleccionar</p>
        <p className="text-xs text-gray-400 mt-1">Los archivos se almacenan en Supabase Storage</p>
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
            <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <File className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
                <span className="text-xs text-gray-400">({(item.size / 1024).toFixed(1)} KB)</span>
              </div>
              <div className="flex items-center gap-1">
                {item.status === 'pending' && (
                  <button onClick={() => handleUpload(i)} disabled={uploading} className="text-agency-600 hover:text-agency-800 text-xs font-medium px-2 py-1">
                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Subir'}
                  </button>
                )}
                {item.status === 'uploading' && <Loader2 className="w-3.5 h-3.5 animate-spin text-agency-600" />}
                {item.status === 'done' && <span className="text-xs text-green-600">✓</span>}
                {item.status === 'error' && <span className="text-xs text-red-600">Error</span>}
                <button onClick={() => removeFile(i)} className="p-1 hover:bg-gray-200 rounded">
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
