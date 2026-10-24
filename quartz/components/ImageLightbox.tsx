import { QuartzComponent, QuartzComponentConstructor } from "./types"
import style from "./styles/imageLightbox.scss"
// @ts-ignore
import script from "./scripts/imageLightbox.inline"

const ImageLightbox: QuartzComponent = () => (
  <dialog class="image-lightbox" role="dialog" aria-modal="true" aria-label="Zvětšený obrázek">
    <button type="button" aria-label="Zavřít obrázek">
      ✕
    </button>
    <img alt="" />
  </dialog>
)
ImageLightbox.css = style
ImageLightbox.afterDOMLoaded = script
export default (() => ImageLightbox) satisfies QuartzComponentConstructor
