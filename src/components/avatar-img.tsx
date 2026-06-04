const sizeMap = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
}

export function AvatarImg({
  src,
  name,
  size = "md",
  className = "",
}: {
  src: string | null | undefined
  name: string | null | undefined
  size?: keyof typeof sizeMap
  className?: string
}) {
  const sizeClass = sizeMap[size]
  const baseClass = `rounded-full shrink-0 ${sizeClass} ${className}`

  return src ? (
    <img src={src} alt="" className={`object-cover ${baseClass}`} />
  ) : (
    <span className={`flex items-center justify-center bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400 ${baseClass}`}>
      {(name || "?")[0].toUpperCase()}
    </span>
  )
}
