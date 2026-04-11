import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Upload, X, Check, Image } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ImagePicker({ value, onChange, onClose }) {
  const [media, setMedia] = useState([])
  const [tab, setTab] = useState('library')
  const [uploading, setUploading] = useState(false)

  useEffect(() => { loadMedia() }, [])

  async function loadMedia() {
    try {
      const items = await api.getMedia()
      // Si no hay imágenes en DB, mostrar las de /galeria/ como fallback
      if (items.length === 0) {
        const galeria = [
          '/galeria/flores-eternas-01.jpg','/galeria/flores-eternas-02.jpg','/galeria/flores-eternas-03.jpg',
          '/galeria/flores-eternas-04.jpg','/galeria/flores-eternas-05.jpg',
          '/galeria/peluche-01.jpg','/galeria/peluche-02.jpg','/galeria/peluche-03.jpg','/galeria/peluche-04.jpg',
          '/galeria/regalo-01.jpg','/galeria/regalo-02.jpg','/galeria/regalo-03.jpg',
          '/galeria/regalo-04.jpg','/galeria/regalo-05.jpg','/galeria/regalo-06.jpg',
          '/galeria/accesorio-01.jpg','/galeria/accesorio-02.jpg','/galeria/accesorio-03.jpg',
          '/galeria/accesorio-04.jpg','/galeria/accesorio-05.jpg',
          '/galeria/detalle-01.jpg','/galeria/detalle-02.jpg','/galeria/detalle-03.jpg',
          '/galeria/detalle-04.jpg','/galeria/detalle-05.jpg','/galeria/detalle-06.jpg',
          '/galeria/arreglo-floral-01.jpg','/galeria/arreglo-floral-02.jpg',
          '/galeria/arreglo-floral-03.jpg','/galeria/arreglo-floral-04.jpg',
          '/galeria/Logo.png',
        ]
        setMedia(galeria.map((url, i) => ({ id: `g-${i}`, url, filename: url.split('/').pop() })))
      } else {
        setMedia(items)
      }
    } catch (e) { toast.error(e.message) }
  }

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const item = await api.uploadMedia(file)
      await loadMedia()
      onChange(item.url)
      toast.success('Imagen subida')
      onClose()
    } catch (err) { toast.error(err.message) }
    finally { setUploading(false) }
  }

  async function handleDelete(id, e) {
    e.stopPropagation()
    if (!confirm('¿Eliminar imagen?')) return
    try { await api.deleteMedia(id); loadMedia() } catch (err) { toast.error(err.message) }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-dark">Seleccionar imagen</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex gap-2 px-4 pt-3">
          <button onClick={() => setTab('library')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${tab === 'library' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
            Biblioteca ({media.length})
          </button>
          <button onClick={() => setTab('upload')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${tab === 'upload' ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
            Subir nueva
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'library' && (
            media.length === 0 ? (
              <div className="text-center py-12 text-gray-300">
                <Image className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">No hay imágenes subidas aún</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {media.map(m => (
                  <div key={m.id} onClick={() => { onChange(m.url); onClose() }}
                    className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all hover:border-brand-400 group ${value === m.url ? 'border-brand-500' : 'border-transparent'}`}>
                    <img src={m.url} alt="" className="w-full h-24 object-cover" />
                    {value === m.url && (
                      <div className="absolute inset-0 bg-brand-500/20 flex items-center justify-center">
                        <Check className="w-6 h-6 text-brand-600" />
                      </div>
                    )}
                    <button onClick={(e) => handleDelete(m.id, e)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'upload' && (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-brand-200 rounded-2xl p-12 cursor-pointer hover:border-brand-400 transition-colors">
              {uploading ? (
                <div className="text-brand-500 text-sm">Subiendo...</div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-brand-300 mb-3" />
                  <p className="text-sm text-gray-500 mb-1">Haz clic para seleccionar una imagen</p>
                  <p className="text-xs text-gray-300">JPG, PNG, WEBP — máx 10MB</p>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          )}
        </div>
      </div>
    </div>
  )
}
