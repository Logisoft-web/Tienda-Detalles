import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import toast from 'react-hot-toast'
import { Save, Plus, Trash2, Star, ImageIcon, GripVertical, Sparkles } from 'lucide-react'
import ImagePicker from '../../components/admin/ImagePicker'

export default function SiteEditor() {
  const [config, setConfig] = useState(null)
  const [saving, setSaving] = useState({})
  const [tab, setTab] = useState('hero')
  const [picker, setPicker] = useState(null)

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
    setSaving(s => ({ ...s, [key]: true }))
    try {
      await api.updateSiteConfig(key, value)
      toast.success('✓ Guardado')
    } catch (e) { toast.error(e.message) }
    finally { setSaving(s => ({ ...s, [key]: false })) }
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

  if (!config) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3 text-brand-300">
        <Sparkles className="w-8 h-8 animate-pulse" />
        <p className="text-sm">Cargando editor...</p>
      </div>
    </div>
  )

  const TABS = [
    { id: 'hero',         label: '🖼️ Hero',      desc: 'Collage principal' },
    { id: 'gallery',      label: '🎨 Galería',    desc: 'Fotos del trabajo' },
    { id: 'testimonials', label: '💬 Opiniones',  desc: 'Reseñas de clientes' },
  ]

  return (
    <div className="space-y-5 pb-20 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="font-script text-3xl text-rose-600 flex items-center gap-2">
          <Sparkles className="w-6 h-6" /> Editor Web
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">Personaliza la página principal de tu tienda</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              tab === t.id
                ? 'bg-brand-500 text-white shadow-brand'
                : 'bg-white text-gray-400 border border-brand-100 hover:border-brand-300 hover:text-brand-500'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── HERO ── */}
      {tab === 'hero' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-100 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-dark">Collage de imágenes</h3>
              <p className="text-xs text-gray-400 mt-0.5">4 fotos que aparecen en la sección principal</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[0,1,2,3].map(i => (
              <div key={i} onClick={() => setPicker({ key: 'hero', index: i })}
                className="group relative rounded-2xl overflow-hidden border-2 border-dashed border-brand-200 bg-brand-50/30 cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-all"
                style={{ paddingBottom: '100%', height: 0 }}>
                <div className="absolute inset-0">
                {config.hero_images[i] ? (
                  <>
                    <img src={config.hero_images[i]} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <span className="text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        Cambiar foto
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 p-4">
                    <ImageIcon className="w-8 h-8 text-brand-200" />
                    <span className="text-xs text-brand-300 text-center">Foto {i + 1}</span>
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-white/90 text-brand-500 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                  {i + 1}
                </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => save('hero_images', config.hero_images)}
            disabled={saving.hero_images}
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-2xl text-sm transition-colors disabled:opacity-60 shadow-brand">
            <Save className="w-4 h-4" />
            {saving.hero_images ? 'Guardando...' : 'Guardar collage'}
          </button>
        </div>
      )}

      {/* ── GALERÍA ── */}
      {tab === 'gallery' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-100 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-dark">Galería de fotos</h3>
              <p className="text-xs text-gray-400 mt-0.5">{config.gallery_images.length} imágenes · Haz clic para cambiar, arrastra para reordenar</p>
            </div>
            <button onClick={() => setPicker({ key: 'gallery_add' })}
              className="flex items-center gap-1.5 bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-600 transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Agregar foto
            </button>
          </div>

          {config.gallery_images.length === 0 ? (
            <div className="border-2 border-dashed border-brand-200 rounded-2xl p-12 text-center">
              <ImageIcon className="w-12 h-12 text-brand-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No hay imágenes en la galería</p>
              <button onClick={() => setPicker({ key: 'gallery_add' })}
                className="mt-4 text-brand-500 text-sm font-bold hover:underline">
                + Agregar primera foto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {config.gallery_images.map((url, i) => (
                <div key={`${url}-${i}`}
                  className="group relative rounded-2xl overflow-hidden bg-brand-50 cursor-pointer shadow-sm hover:shadow-brand transition-all hover:-translate-y-0.5"
                  style={{ aspectRatio: '1/1' }}
                  onClick={() => setPicker({ key: 'gallery', index: i })}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                    <span className="text-white text-xs font-bold">Cambiar</span>
                    <button onClick={e => { e.stopPropagation(); removeGalleryImage(i) }}
                      className="bg-red-500 text-white rounded-lg p-1 hover:bg-red-600 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 bg-black/40 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {i + 1}
                  </div>
                </div>
              ))}

              {/* Botón agregar inline */}
              <div onClick={() => setPicker({ key: 'gallery_add' })}
                className="rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/50 cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-all flex flex-col items-center justify-center gap-2"
                style={{ aspectRatio: '1/1' }}>
                <Plus className="w-6 h-6 text-brand-300" />
                <span className="text-xs text-brand-300 font-bold">Agregar</span>
              </div>
            </div>
          )}

          <button onClick={() => save('gallery_images', config.gallery_images)} disabled={saving.gallery_images}
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-2xl text-sm transition-colors disabled:opacity-60 shadow-brand">
            <Save className="w-4 h-4" />
            {saving.gallery_images ? 'Guardando...' : `Guardar galería (${config.gallery_images.length} fotos)`}
          </button>
        </div>
      )}

      {/* ── TESTIMONIOS ── */}
      {tab === 'testimonials' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-100 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-dark">Opiniones de clientes</h3>
              <p className="text-xs text-gray-400 mt-0.5">{config.testimonials.length} reseñas visibles en la página</p>
            </div>
            <button onClick={addTestimonial}
              className="flex items-center gap-1.5 bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-600 transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Nueva reseña
            </button>
          </div>

          <div className="space-y-3">
            {config.testimonials.map((t, i) => (
              <div key={i} className="border border-brand-100 rounded-2xl p-4 space-y-3 bg-brand-50/20 hover:bg-brand-50/40 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-200 bg-white flex-shrink-0 cursor-pointer hover:border-brand-400 transition-colors shadow-sm"
                      onClick={() => setPicker({ key: 'testimonial', index: i })}>
                      {t.image
                        ? <img src={t.image} alt="" className="w-full h-full object-cover" />
                        : <div className="flex items-center justify-center h-full text-brand-200">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                      }
                    </div>
                    {/* Estrellas */}
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} onClick={() => updateTestimonial(i, 'stars', s)}
                          className="transition-transform hover:scale-125">
                          <Star className={`w-4 h-4 transition-colors ${s <= t.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 hover:text-yellow-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => removeTestimonial(i)}
                    className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input placeholder="Nombre del cliente" value={t.name}
                    onChange={e => updateTestimonial(i, 'name', e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400 transition-colors" />
                  <textarea placeholder="Escribe la opinión aquí..." value={t.text} rows={2}
                    onChange={e => updateTestimonial(i, 'text', e.target.value)}
                    className="sm:col-span-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-400 resize-none transition-colors" />
                </div>

                <p className="text-xs text-gray-300 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  Haz clic en el avatar para agregar foto del cliente
                </p>
              </div>
            ))}

            {config.testimonials.length === 0 && (
              <div className="border-2 border-dashed border-brand-200 rounded-2xl p-10 text-center">
                <p className="text-gray-400 text-sm mb-3">No hay opiniones todavía</p>
                <button onClick={addTestimonial} className="text-brand-500 text-sm font-bold hover:underline">
                  + Agregar primera reseña
                </button>
              </div>
            )}
          </div>

          <button onClick={() => save('testimonials', config.testimonials)} disabled={saving.testimonials}
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-2xl text-sm transition-colors disabled:opacity-60 shadow-brand">
            <Save className="w-4 h-4" />
            {saving.testimonials ? 'Guardando...' : 'Guardar opiniones'}
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
