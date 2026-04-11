import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import toast from 'react-hot-toast'
import { Save, Plus, Trash2, Star } from 'lucide-react'
import ImagePicker from '../../components/admin/ImagePicker'

export default function SiteEditor() {
  const [config, setConfig] = useState(null)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('hero')
  const [picker, setPicker] = useState(null) // { key, index? }

  useEffect(() => { loadConfig() }, [])

  async function loadConfig() {
    try {
      const c = await api.getSiteConfig()
      setConfig({
        hero_title:    c.hero_title    || 'Detalles que enamoran',
        hero_subtitle: c.hero_subtitle || '',
        hero_images:   Array.isArray(c.hero_images)    ? c.hero_images    : [],
        gallery_images:Array.isArray(c.gallery_images) ? c.gallery_images : [],
        testimonials:  Array.isArray(c.testimonials)   ? c.testimonials   : [],
      })
    } catch (e) { toast.error(e.message) }
  }

  async function save(key, value) {
    setSaving(true)
    try {
      await api.updateSiteConfig(key, value)
      toast.success('Guardado')
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  function updateHeroImage(index, url) {
    const imgs = [...config.hero_images]
    imgs[index] = url
    setConfig(c => ({ ...c, hero_images: imgs }))
  }

  function updateGalleryImage(index, url) {
    const imgs = [...config.gallery_images]
    imgs[index] = url
    setConfig(c => ({ ...c, gallery_images: imgs }))
  }

  function addGalleryImage(url) {
    setConfig(c => ({ ...c, gallery_images: [...c.gallery_images, url] }))
  }

  function removeGalleryImage(index) {
    setConfig(c => ({ ...c, gallery_images: c.gallery_images.filter((_, i) => i !== index) }))
  }

  function updateTestimonial(index, field, value) {
    const t = [...config.testimonials]
    t[index] = { ...t[index], [field]: value }
    setConfig(c => ({ ...c, testimonials: t }))
  }

  function addTestimonial() {
    setConfig(c => ({ ...c, testimonials: [...c.testimonials, { name: '', text: '', stars: 5 }] }))
  }

  function removeTestimonial(index) {
    setConfig(c => ({ ...c, testimonials: c.testimonials.filter((_, i) => i !== index) }))
  }

  if (!config) return <div className="flex items-center justify-center h-64 text-gray-300">Cargando...</div>

  const TABS = [
    { id: 'hero',        label: 'Hero' },
    { id: 'gallery',     label: 'Galería' },
    { id: 'testimonials',label: 'Opiniones' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-brand-100 pb-2 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-t-lg text-sm font-bold whitespace-nowrap transition-colors ${tab === t.id ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-brand-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── HERO ── */}
      {tab === 'hero' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-100 space-y-5">
          <h3 className="font-bold text-dark">Imágenes del collage</h3>

          <div className="grid grid-cols-2 gap-3">
            {[0,1,2,3].map(i => (
              <div key={i} className="space-y-2">
                <div className="relative rounded-xl overflow-hidden border border-brand-100 h-40 bg-gray-50 cursor-pointer hover:border-brand-400 transition-colors"
                  onClick={() => setPicker({ key: 'hero', index: i })}>
                  {config.hero_images[i]
                    ? <img src={config.hero_images[i]} alt="" className="w-full h-full object-cover" />
                    : <div className="flex items-center justify-center h-full text-gray-300 text-xs">Clic para elegir</div>
                  }
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="text-white text-xs font-bold opacity-0 hover:opacity-100 bg-black/40 px-2 py-1 rounded">Cambiar</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => save('hero_images', config.hero_images)}
            disabled={saving}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors disabled:opacity-60">
            <Save className="w-4 h-4" /> Guardar imágenes
          </button>
        </div>
      )}

      {/* ── GALERÍA ── */}
      {tab === 'gallery' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-dark">Galería ({config.gallery_images.length} imágenes)</h3>
            <button onClick={() => setPicker({ key: 'gallery_add' })}
              className="flex items-center gap-1 bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-600 transition-colors">
              <Plus className="w-4 h-4" /> Agregar
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {config.gallery_images.map((url, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border border-brand-100 h-24 cursor-pointer"
                onClick={() => setPicker({ key: 'gallery', index: i })}>
                <img src={url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                <button onClick={e => { e.stopPropagation(); removeGalleryImage(i) }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <button onClick={() => save('gallery_images', config.gallery_images)} disabled={saving}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors disabled:opacity-60">
            <Save className="w-4 h-4" /> Guardar Galería
          </button>
        </div>
      )}

      {/* ── TESTIMONIOS ── */}
      {tab === 'testimonials' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-dark">Opiniones</h3>
            <button onClick={addTestimonial}
              className="flex items-center gap-1 bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-600 transition-colors">
              <Plus className="w-4 h-4" /> Agregar
            </button>
          </div>

          <div className="space-y-4">
            {config.testimonials.map((t, i) => (
              <div key={i} className="border border-brand-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => updateTestimonial(i, 'stars', s)}>
                        <Star className={`w-4 h-4 ${s <= t.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      </button>
                    ))}
                  </div>
                  <button onClick={() => removeTestimonial(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input placeholder="Nombre" value={t.name}
                  onChange={e => updateTestimonial(i, 'name', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-400" />
                <textarea placeholder="Opinión" value={t.text} rows={2}
                  onChange={e => updateTestimonial(i, 'text', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand-400 resize-none" />
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-brand-100 bg-gray-50 flex-shrink-0 cursor-pointer hover:border-brand-400 transition-colors"
                    onClick={() => setPicker({ key: 'testimonial', index: i })}>
                    {t.image
                      ? <img src={t.image} alt="" className="w-full h-full object-cover" />
                      : <div className="flex items-center justify-center h-full text-gray-300 text-xs text-center leading-tight p-1">foto</div>
                    }
                  </div>
                  <span className="text-xs text-gray-400">Foto opcional del cliente</span>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => save('testimonials', config.testimonials)} disabled={saving}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors disabled:opacity-60">
            <Save className="w-4 h-4" /> Guardar Opiniones
          </button>
        </div>
      )}

      {/* Image Picker Modal */}
      {picker && (
        <ImagePicker
          value={
            picker.key === 'hero' ? config.hero_images[picker.index] :
            picker.key === 'gallery' ? config.gallery_images[picker.index] : null
          }
          onChange={url => {
            if (picker.key === 'hero') updateHeroImage(picker.index, url)
            else if (picker.key === 'gallery') updateGalleryImage(picker.index, url)
            else if (picker.key === 'gallery_add') addGalleryImage(url)
            else if (picker.key === 'testimonial') updateTestimonial(picker.index, 'image', url)
          }}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  )
}
