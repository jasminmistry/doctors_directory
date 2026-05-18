const HUB_TEMPLATE_THUMBNAIL_PATHS = [
  "/directory/images/template-thumbnails/t-5-images-img.jpg",
  "/directory/images/template-thumbnails/t-5-images-img1.jpg",
  "/directory/images/template-thumbnails/t-5-images-img2.jpg",
  "/directory/images/template-thumbnails/t-5-images-img3.jpg",
  "/directory/images/template-thumbnails/t-5-images-img4.jpg",
  "/directory/images/template-thumbnails/t-5-images-img5.jpg",
  "/directory/images/template-thumbnails/t-5-images-img6.png",
  "/directory/images/template-thumbnails/t-6-images-img.png",
  "/directory/images/template-thumbnails/t-6-images-img1.png",
  "/directory/images/template-thumbnails/t-6-images-img10.png",
  "/directory/images/template-thumbnails/t-6-images-img11.png",
  "/directory/images/template-thumbnails/t-6-images-img2.png",
  "/directory/images/template-thumbnails/t-6-images-img4.png",
  "/directory/images/template-thumbnails/t-6-images-img5.png",
  "/directory/images/template-thumbnails/t-6-images-img6.png",
  "/directory/images/template-thumbnails/t-6-images-img7.png",
  "/directory/images/template-thumbnails/t-6-images-img8.png",
  "/directory/images/template-thumbnails/t-6-images-img9.png",
  "/directory/images/template-thumbnails/t-7-images-img.jpg",
  "/directory/images/template-thumbnails/t-7-images-img1.jpg",
  "/directory/images/template-thumbnails/t-7-images-img10.jpg",
  "/directory/images/template-thumbnails/t-7-images-img11.jpg",
  "/directory/images/template-thumbnails/t-7-images-img12.jpg",
  "/directory/images/template-thumbnails/t-7-images-img13.jpg",
  "/directory/images/template-thumbnails/t-7-images-img14.jpg",
  "/directory/images/template-thumbnails/t-7-images-img2.jpg",
  "/directory/images/template-thumbnails/t-7-images-img3.jpg",
  "/directory/images/template-thumbnails/t-7-images-img4.jpg",
  "/directory/images/template-thumbnails/t-7-images-img5.jpg",
  "/directory/images/template-thumbnails/t-7-images-img6.jpg",
  "/directory/images/template-thumbnails/t-7-images-img7.jpg",
  "/directory/images/template-thumbnails/t-7-images-img8.jpg",
  "/directory/images/template-thumbnails/t-7-images-img9.jpg",
  "/directory/images/template-thumbnails/t-8-images-img.jpg",
  "/directory/images/template-thumbnails/t-8-images-img1.jpg",
  "/directory/images/template-thumbnails/t-8-images-img2.jpg",
  "/directory/images/template-thumbnails/t-8-images-img3.jpg",
  "/directory/images/template-thumbnails/t-8-images-img4.jpg",
  "/directory/images/template-thumbnails/t-8-images-img5.jpg",
  "/directory/images/template-thumbnails/t-8-images-img6.jpg",
  "/directory/images/template-thumbnails/t-8-images-img7.jpg",
  "/directory/images/template-thumbnails/t-8-images-img8.jpg",
  "/directory/images/template-thumbnails/t-8-images-img9.jpg",
] as const

export const HUB_TEMPLATE_THUMBNAIL_COUNT = HUB_TEMPLATE_THUMBNAIL_PATHS.length

function pickPath(index: number) {
  const len = HUB_TEMPLATE_THUMBNAIL_PATHS.length
  return HUB_TEMPLATE_THUMBNAIL_PATHS[((index % len) + len) % len]
}

export function hubTemplateThumbnailForKey(key: string): string {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0
  return pickPath(Math.abs(h))
}

export function hubTemplateThumbnailByIndex(index: number): string {
  return pickPath(index)
}
