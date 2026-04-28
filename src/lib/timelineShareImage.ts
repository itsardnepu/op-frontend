/**
 * Renders a DOM subtree to a JPEG using html2canvas.
 * Temporarily expands the horizontal timeline so the full day is visible in one image.
 */
const JPEG_QUALITY = 0.92

const EXPORT_LIGHT_BG = '#f8fafc'
const EXPORT_DARK_BG = '#020617'
const EXPORT_DARK_PANEL = '#0f172a'
const EXPORT_DARK_RAIL = '#1e293b'
const EXPORT_DARK_MUTED_TEXT = '#94a3b8'
const EXPORT_DARK_TEXT = '#e2e8f0'
const EXPORT_DARK_HOUR_RULER_BG = '#2d1b36'
const EXPORT_DARK_HOUR_RULER_BORDER = '#86198f'

function loosenRowsForExport(clonedDoc: Document) {
  const root = clonedDoc.querySelector('[data-timeline-share-root]') as HTMLElement | null
  if (!root) return

  const isDarkExport = root.getAttribute('data-timeline-share-export-bg') === 'dark'
  const canvasBg = isDarkExport ? EXPORT_DARK_BG : EXPORT_LIGHT_BG

  // Avoid clipping from rounded card + glass; flatten for a clean export.
  root.style.setProperty('overflow', 'visible', 'important')
  root.style.setProperty('backdrop-filter', 'none', 'important')
  root.style.setProperty('-webkit-backdrop-filter', 'none', 'important')
  root.style.backgroundColor = canvasBg
  root.style.paddingBottom = '20px'

  const labelCol = root.querySelector('[data-timeline-share-label-col]') as HTMLElement | null
  if (labelCol) {
    labelCol.style.paddingTop = '4px'
    labelCol.style.paddingBottom = '8px'
    labelCol.style.paddingLeft = '6px'
    labelCol.style.paddingRight = '6px'
  }

  root.querySelectorAll('.timeline-export-row').forEach((node) => {
    const el = node as HTMLElement
    el.style.setProperty('height', 'auto', 'important')
    el.style.setProperty('min-height', '44px', 'important')
    el.style.setProperty('line-height', '1.35', 'important')
    el.style.setProperty('padding-top', '6px', 'important')
    el.style.setProperty('padding-bottom', '6px', 'important')
    el.style.setProperty('padding-left', '4px', 'important')
    el.style.setProperty('padding-right', '4px', 'important')
    el.style.setProperty('overflow', 'visible', 'important')
    el.style.setProperty('box-sizing', 'border-box', 'important')
    el.style.setProperty('display', 'flex', 'important')
    el.style.setProperty('align-items', 'center', 'important')
  })

  const trackCol = root.querySelector('[data-timeline-share-track-col]') as HTMLElement | null
  if (trackCol) {
    trackCol.style.overflow = 'visible'
    trackCol.style.paddingTop = '8px'
    trackCol.style.paddingBottom = '16px'
  }

  root.querySelectorAll('[data-timeline-share-inner-bar]').forEach((node) => {
    const el = node as HTMLElement
    el.style.setProperty('line-height', '1.35', 'important')
    el.style.setProperty('overflow', 'visible', 'important')
    el.style.setProperty('padding-top', '4px', 'important')
    el.style.setProperty('padding-bottom', '4px', 'important')
    el.style.setProperty('display', 'flex', 'important')
    el.style.setProperty('align-items', 'center', 'important')
    el.style.setProperty('justify-content', 'center', 'important')
  })

  root.querySelectorAll('[data-timeline-share-inner-bar] span, [data-timeline-share-inner-bar] div').forEach((node) => {
    const el = node as HTMLElement
    el.style.setProperty('line-height', '1.35', 'important')
    el.style.setProperty('overflow', 'visible', 'important')
  })

  // Long labels: avoid bottom clipping from single-line truncate in the export clone.
  root.querySelectorAll('[data-timeline-share-label-col] .timeline-export-row span').forEach((node) => {
    const el = node as HTMLElement
    el.classList.remove('truncate')
    el.style.setProperty('white-space', 'normal', 'important')
    el.style.setProperty('overflow', 'visible', 'important')
    el.style.setProperty('word-break', 'break-word', 'important')
  })

  // External floating labels: drop vertical centering transform that often clips in canvas.
  root.querySelectorAll('[data-timeline-share-external-label]').forEach((node) => {
    const el = node as HTMLElement
    el.style.setProperty('transform', 'none', 'important')
    el.style.setProperty('top', '0', 'important')
    el.style.setProperty('bottom', '0', 'important')
    el.style.setProperty('margin', 'auto', 'important')
    el.style.setProperty('height', 'fit-content', 'important')
  })

  if (!isDarkExport) return

  const frame = root.querySelector('[data-timeline-share-timeline-frame]') as HTMLElement | null
  if (frame) {
    frame.style.setProperty('background-color', EXPORT_DARK_PANEL, 'important')
    frame.style.setProperty('box-shadow', 'none', 'important')
    frame.style.setProperty('border', '1px solid #334155', 'important')
    frame.style.setProperty('--tw-ring-width', '0', 'important')
  }

  const chipsWrap = root.querySelector('[data-timeline-share-chips-wrap]') as HTMLElement | null
  if (chipsWrap) {
    chipsWrap.style.setProperty('background-color', EXPORT_DARK_PANEL, 'important')
    chipsWrap.style.setProperty('backdrop-filter', 'none', 'important')
    chipsWrap.style.setProperty('-webkit-backdrop-filter', 'none', 'important')
    chipsWrap.style.setProperty('border', '1px solid #334155', 'important')
    chipsWrap.style.setProperty('box-shadow', 'none', 'important')
  }

  root.querySelectorAll('h2, h3').forEach((node) => {
    const el = node as HTMLElement
    if (el.closest('[data-timeline-share-timeline-frame]')) return
    if (el.closest('[data-timeline-share-chips-wrap]')) return
    el.style.setProperty('color', EXPORT_DARK_TEXT, 'important')
  })
  root.querySelectorAll('p').forEach((node) => {
    const el = node as HTMLElement
    if (el.closest('[data-timeline-share-timeline-frame]')) return
    if (el.closest('[data-timeline-share-chips-wrap]')) return
    el.style.setProperty('color', EXPORT_DARK_MUTED_TEXT, 'important')
  })

  if (labelCol) {
    labelCol.querySelectorAll('.timeline-export-row, .timeline-export-row span').forEach((node) => {
      ;(node as HTMLElement).style.setProperty('color', EXPORT_DARK_TEXT, 'important')
    })
  }

  root.querySelectorAll('[data-timeline-share-hour-ruler]').forEach((node) => {
    const el = node as HTMLElement
    el.style.setProperty('background-color', EXPORT_DARK_HOUR_RULER_BG, 'important')
    el.style.setProperty('box-shadow', 'inset 0 1px 2px rgba(0,0,0,0.45)', 'important')
    el.style.setProperty('border', `1px solid ${EXPORT_DARK_HOUR_RULER_BORDER}`, 'important')
    el.style.setProperty('--tw-ring-width', '0', 'important')
    el.querySelectorAll('span').forEach((s) => {
      ;(s as HTMLElement).style.setProperty('color', '#f5d0fe', 'important')
    })
  })

  root.querySelectorAll('[data-timeline-share-track-bar]').forEach((node) => {
    const el = node as HTMLElement
    el.style.setProperty('background-color', EXPORT_DARK_RAIL, 'important')
    el.style.setProperty('box-shadow', 'inset 0 1px 2px rgba(0,0,0,0.35)', 'important')
  })

  root.querySelectorAll('[data-timeline-share-external-label]').forEach((node) => {
    ;(node as HTMLElement).style.setProperty('color', '#f8fafc', 'important')
  })
}

export async function captureTimelineShareJpeg(root: HTMLElement, scrollSelector = '[data-timeline-share-scroll]'): Promise<Blob> {
  const html2canvas = (await import('html2canvas')).default

  const scrollArea = root.querySelector(scrollSelector) as HTMLElement | null
  const track = scrollArea?.firstElementChild as HTMLElement | null

  let restore: (() => void) | null = null
  if (scrollArea && track) {
    const prevScrollLeft = scrollArea.scrollLeft
    const prevOverflow = scrollArea.style.overflow
    const prevScrollW = scrollArea.style.width
    const prevScrollMaxW = scrollArea.style.maxWidth
    const prevTrackW = track.style.width
    const prevTrackMinW = track.style.minWidth

    scrollArea.scrollLeft = 0
    const fullW = Math.max(track.scrollWidth, track.getBoundingClientRect().width)
    scrollArea.style.overflow = 'visible'
    scrollArea.style.width = `${Math.ceil(fullW)}px`
    scrollArea.style.maxWidth = 'none'
    track.style.width = `${Math.ceil(fullW)}px`
    track.style.minWidth = `${Math.ceil(fullW)}px`

    restore = () => {
      scrollArea.style.overflow = prevOverflow
      scrollArea.style.width = prevScrollW
      scrollArea.style.maxWidth = prevScrollMaxW
      track.style.width = prevTrackW
      track.style.minWidth = prevTrackMinW
      scrollArea.scrollLeft = prevScrollLeft
    }
  }

  const scale = Math.min(3, Math.max(2, typeof window !== 'undefined' ? window.devicePixelRatio || 2 : 2))

  const exportBg =
    root.getAttribute('data-timeline-share-export-bg') === 'dark' ? EXPORT_DARK_BG : EXPORT_LIGHT_BG

  try {
    const canvas = await html2canvas(root, {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: exportBg,
      logging: false,
      ignoreElements: (node) => node instanceof Element && node.hasAttribute('data-html2canvas-ignore'),
      onclone: (clonedDoc) => {
        loosenRowsForExport(clonedDoc)
      },
    })
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b)
          else reject(new Error('JPEG export failed'))
        },
        'image/jpeg',
        JPEG_QUALITY
      )
    })
  } finally {
    restore?.()
  }
}
