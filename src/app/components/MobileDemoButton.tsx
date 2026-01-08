import { motion } from 'motion/react';
import { Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MobileDemoButton() {
  return (
    <Link to="/mobile-demo">
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-2xl flex items-center justify-center"
        style={{
          backgroundColor: '#FFD600',
          color: '#000000',
        }}
        title="Ver Demo Móvil"
      >
        <Smartphone size={24} strokeWidth={2.5} />
      </motion.button>
    </Link>
  );
}
