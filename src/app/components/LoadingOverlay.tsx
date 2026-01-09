import { motion } from 'motion/react';

interface LoadingOverlayProps {
  message?: string;
}

const LOADING_MESSAGES = [
  'Renderizando tu obra maestra...',
  'Aplicando tinta digital...',
  'Preparando tu diseño...',
  'Creando magia...',
];

export function LoadingOverlay({ message }: LoadingOverlayProps) {
  const displayMessage = message || LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
    >
      <div className="text-center">
        {/* Spinner */}
        <motion.div
          className="mx-auto mb-6 h-16 w-16 rounded-full border-4 border-muted"
          style={{
            borderTopColor: '#FFD600',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-semibold text-foreground"
        >
          {displayMessage}
        </motion.p>

        {/* Progress Bar */}
        <div className="mt-4 mx-auto w-64 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: '#FFD600' }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}