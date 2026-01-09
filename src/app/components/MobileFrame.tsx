import { motion } from 'motion/react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* iPhone 14 Frame */}
        <div
          className="relative mx-auto overflow-hidden bg-black shadow-2xl"
          style={{
            width: '390px',
            height: '844px',
            borderRadius: '60px',
            border: '14px solid #1F2937',
          }}
        >
          {/* Dynamic Island */}
          <div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-black z-50"
            style={{
              width: '126px',
              height: '37px',
              borderBottomLeftRadius: '20px',
              borderBottomRightRadius: '20px',
            }}
          />

          {/* Screen Content */}
          <div className="w-full h-full overflow-hidden bg-white">
            {children}
          </div>
        </div>

        {/* Side Buttons */}
        <div
          className="absolute left-0 top-[120px] w-1 h-8 bg-gray-700 rounded-r-sm"
          style={{ transform: 'translateX(-14px)' }}
        />
        <div
          className="absolute left-0 top-[180px] w-1 h-12 bg-gray-700 rounded-r-sm"
          style={{ transform: 'translateX(-14px)' }}
        />
        <div
          className="absolute left-0 top-[240px] w-1 h-12 bg-gray-700 rounded-r-sm"
          style={{ transform: 'translateX(-14px)' }}
        />
        <div
          className="absolute right-0 top-[200px] w-1 h-20 bg-gray-700 rounded-l-sm"
          style={{ transform: 'translateX(14px)' }}
        />

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <p
            className="text-lg"
            style={{
              fontWeight: 700,
              color: '#0F172A',
            }}
          >
            Vista Móvil - iPhone 14
          </p>
          <p
            className="text-sm mt-1"
            style={{
              fontWeight: 500,
              color: '#6B7280',
            }}
          >
            390 × 844 px
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
