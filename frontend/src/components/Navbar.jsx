export default function Navbar() {
  return (
    <header
      className="flex items-center justify-between px-6 shrink-0 bg-white"
      style={{ height: 56, borderBottom: '1px solid #e5e7eb' }}
    >
      <span
        className="text-[15px] font-semibold text-gray-900"
        style={{ letterSpacing: '-0.01em' }}
      >
        Art of Image Processing
      </span>

      <span className="text-[11px] text-gray-400">
        Digital Image Processing
      </span>
    </header>
  )
}
