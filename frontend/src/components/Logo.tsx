import { Zap } from 'lucide-react'

export default function Logo() {
  return (
    <div className="w-12 h-12 rounded-xl bg-[#0066ff] flex items-center justify-center shadow-[0_0_24px_rgba(0,102,255,0.4)]">
      <Zap className="w-6 h-6 text-white fill-white" strokeWidth={0} />
    </div>
  )
}
