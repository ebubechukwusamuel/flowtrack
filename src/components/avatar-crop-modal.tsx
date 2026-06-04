"use client"

import { useState, useCallback } from "react"
import Cropper, { Area } from "react-easy-crop"
import { motion, AnimatePresence } from "framer-motion"
import { CropIcon, LoaderPinwheel } from "lucide-react"

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const image = await createImage(imageSrc)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      canvas.width = pixelCrop.width
      canvas.height = pixelCrop.height
      ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y,
        pixelCrop.width, pixelCrop.height,
        0, 0,
        pixelCrop.width, pixelCrop.height
      )
      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error("Canvas toBlob failed")); return }
        resolve(blob)
      }, "image/jpeg", 0.9)
    } catch (e) {
      reject(e)
    }
  })
}

interface Props {
  imageUrl: string
  onCrop: (blob: Blob) => void
  onCancel: () => void
  uploading: boolean
}

export function AvatarCropModal({ imageUrl, onCrop, onCancel, uploading }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  async function handleSave() {
    if (!croppedAreaPixels) return
    const blob = await getCroppedImg(imageUrl, croppedAreaPixels)
    onCrop(blob)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg rounded-2xl bg-[#1A1A1A] border border-[#262626] overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#262626]">
            <div className="flex items-center gap-2">
              <CropIcon className="h-4 w-4 text-[#CAFF33]" />
              <h2 className="text-sm font-semibold text-white">Crop Avatar</h2>
            </div>
          </div>

          <div className="relative h-80 bg-black">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="px-5 py-3">
            <label className="text-xs text-zinc-500 mb-1 block">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1 rounded-full appearance-none cursor-pointer bg-[#262626] accent-[#CAFF33]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#262626]">
            <button
              onClick={onCancel}
              disabled={uploading}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#CAFF33] px-5 py-2 text-sm font-medium text-[#1A1A1A] hover:bg-[#d8ff5c] transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <LoaderPinwheel className="h-4 w-4 animate-spin" />
              ) : (
                <CropIcon className="h-4 w-4" />
              )}
              {uploading ? "Saving..." : "Save"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
