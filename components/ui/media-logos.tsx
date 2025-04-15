interface MediaLogosProps {
  className?: string
}

export function MediaLogos({ className = "" }: MediaLogosProps) {
  return (
    <div className={`flex flex-wrap justify-center items-center gap-4 ${className}`}>
      <div className="px-3 py-1 bg-gray-100 rounded-md">
        <span className="font-bold text-gray-700">FORBES</span>
      </div>

      <div className="px-3 py-1 bg-gray-100 rounded-md">
        <span className="font-bold text-blue-700">BUSINESS INSIDER</span>
      </div>

      <div className="px-3 py-1 bg-gray-100 rounded-md">
        <span className="font-bold text-red-700">CNN</span>
      </div>

      <div className="px-3 py-1 bg-gray-100 rounded-md">
        <span className="font-bold text-gray-700">WALL STREET JOURNAL</span>
      </div>
    </div>
  )
}
