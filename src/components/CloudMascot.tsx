import { motion } from 'framer-motion'
import { Cloud } from 'lucide-react'

export function CloudMascot({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 'w-16 h-16', md: 'w-28 h-28', lg: 'w-36 h-36' }

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cloud-blue/40 via-cloud-purple/30 to-cloud-cyan/40 blur-2xl rounded-full scale-150" />

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className={`relative ${dims[size]}`}
      >
        {/* Cloud body */}
        <div className="relative w-full h-full">
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="relative"
              style={{
                width: '100%',
                height: '70%',
              }}
            >
              {/* Cloud shape using rounded blobs */}
              <div className="absolute left-0 bottom-0 w-3/5 h-3/4 bg-gradient-to-br from-cloud-cyan via-white to-cloud-purple rounded-full shadow-lg" />
              <div className="absolute right-0 bottom-0 w-3/5 h-3/4 bg-gradient-to-br from-cloud-cyan via-white to-cloud-purple rounded-full" />
              <div className="absolute left-1/4 bottom-1/4 w-3/5 h-full bg-gradient-to-br from-white via-cloud-cyan to-cloud-blue rounded-full" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-4/5 h-2/3 bg-gradient-to-b from-white to-cloud-cyan rounded-full" />

              {/* Eyes */}
              <div className="absolute left-[35%] top-[35%] flex gap-3 z-10">
                <div className="w-2.5 h-3.5 bg-slate-800 rounded-full" />
                <div className="w-2.5 h-3.5 bg-slate-800 rounded-full" />
              </div>

              {/* Smile */}
              <div className="absolute left-1/2 -translate-x-1/2 top-[55%] z-10">
                <div className="w-5 h-2.5 border-b-2 border-slate-700 rounded-b-full" />
              </div>

              {/* Cheeks */}
              <div className="absolute left-[22%] top-[48%] w-3 h-2 bg-pink-300/50 rounded-full z-10" />
              <div className="absolute right-[22%] top-[48%] w-3 h-2 bg-pink-300/50 rounded-full z-10" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
