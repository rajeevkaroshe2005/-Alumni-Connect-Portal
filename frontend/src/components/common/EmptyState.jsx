import React from 'react'
import { FolderOpen, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function EmptyState({
  icon: Icon = FolderOpen,
  title = "No records found",
  description = "There are currently no items matching your criteria. Try adjusting your filters or search terms.",
  actionLabel,
  actionLink,
  onAction,
}) {
  return (
    <div className="bg-white border border-[#D8D2C4] rounded-2xl p-10 text-center flex flex-col items-center justify-center my-6 max-w-lg mx-auto shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-[#244B3A]/10 border border-[#244B3A]/20 text-[#244B3A] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-[#333333] mb-1">{title}</h3>
      <p className="text-sm text-[#333333]/70 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#244B3A] hover:bg-[#1B3B2B] text-white text-sm font-semibold rounded-xl transition shadow-sm"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
      {actionLabel && onAction && !actionLink && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#244B3A] hover:bg-[#1B3B2B] text-white text-sm font-semibold rounded-xl transition shadow-sm"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
