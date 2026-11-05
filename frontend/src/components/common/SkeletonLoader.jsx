import React from 'react'

export function SkeletonCard({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-[#D8D2C4] rounded-2xl p-6 shadow-sm animate-pulse space-y-4"
        >
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-[#D8D2C4]/40" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[#D8D2C4]/50 rounded w-3/4" />
              <div className="h-3 bg-[#D8D2C4]/30 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-3 bg-[#D8D2C4]/40 rounded w-full" />
            <div className="h-3 bg-[#D8D2C4]/30 rounded w-5/6" />
          </div>
          <div className="flex gap-2 pt-2">
            <div className="h-6 bg-[#244B3A]/10 rounded-lg w-16" />
            <div className="h-6 bg-[#244B3A]/10 rounded-lg w-20" />
          </div>
          <div className="h-9 bg-[#244B3A]/15 rounded-xl w-full mt-4" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTableRow({ rows = 5 }) {
  return (
    <div className="divide-y divide-[#D8D2C4]/60 animate-pulse">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="py-4 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3 w-1/3">
            <div className="w-8 h-8 rounded-full bg-[#D8D2C4]/40" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 bg-[#D8D2C4]/50 rounded w-3/4" />
              <div className="h-2.5 bg-[#D8D2C4]/30 rounded w-1/2" />
            </div>
          </div>
          <div className="h-3 bg-[#D8D2C4]/30 rounded w-1/4" />
          <div className="h-6 bg-[#244B3A]/10 rounded-full w-20" />
          <div className="h-7 bg-[#244B3A]/15 rounded-lg w-16" />
        </div>
      ))}
    </div>
  )
}
