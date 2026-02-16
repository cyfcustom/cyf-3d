import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { showSuccessModalAtom, designPreviewAtom, productConfigAtom } from '../store/atoms';

export function SuccessModal() {
  const [showModal, setShowModal] = useAtom(showSuccessModalAtom);
  const [designPreview] = useAtom(designPreviewAtom);
  const [productConfig] = useAtom(productConfigAtom);
  const { t } = useTranslation('configurator');

  const handleWhatsAppOrder = () => {
    const phoneNumber = '584121234567'; // Replace with actual WhatsApp number
    const productName = t('success.product');
    const message = t('success.whatsAppMessage', { product: productName, size: productConfig.size, color: productConfig.baseColorName });
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    
    // Close modal
    setShowModal(false);
  };

  return (
    <AnimatePresence>
      {showModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl overflow-hidden border border-border"
              style={{ maxHeight: '90vh' }}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted shadow-md hover:bg-accent active:bg-accent/80 transition-colors"
              >
                <X size={20} className="text-foreground" />
              </button>

              {/* Content */}
              <div className="p-6 lg:p-8 text-center overflow-y-auto" style={{ maxHeight: '90vh' }}>
                {/* Success Icon with Animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mx-auto mb-4 lg:mb-6 w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#10B981' }}
                >
                  <Check size={32} className="lg:w-10 lg:h-10" color="white" strokeWidth={3} />
                </motion.div>

                {/* Confetti Effect - Simple dots */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full hidden lg:block"
                    style={{
                      backgroundColor: ['#FFD600', '#FF6B35', '#00B4D8'][i % 3],
                      top: '25%',
                      left: '50%',
                    }}
                    initial={{ opacity: 1, scale: 0 }}
                    animate={{
                      opacity: 0,
                      scale: 1,
                      x: Math.cos((i * 30 * Math.PI) / 180) * 150,
                      y: Math.sin((i * 30 * Math.PI) / 180) * 150,
                    }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                ))}

                {/* Title */}
                <h2 className="text-2xl lg:text-3xl mb-2 font-extrabold text-foreground">
                  {t('success.title')}
                </h2>

                <p className="text-sm lg:text-base mb-4 lg:mb-6 text-muted-foreground font-medium">
                  {t('success.subtitle')}
                </p>

                {/* Design Preview */}
                {designPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-4 lg:mb-6 mx-auto w-full max-w-sm"
                  >
                    <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-muted">
                      <img
                        src={designPreview}
                        alt="Design Preview"
                        className="w-full h-auto"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Product Summary */}
                <div className="mb-4 lg:mb-6 p-3 lg:p-4 rounded-xl bg-muted">
                  <p className="text-sm lg:text-base font-semibold text-foreground">
                    {t('success.product')} • {t('success.size')}{' '}
                    {productConfig.size} • {productConfig.baseColorName}
                  </p>
                </div>

                {/* CTA Button - WhatsApp */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsAppOrder}
                  className="w-full py-4 lg:py-5 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl touch-manipulation font-bold"
                  style={{
                    backgroundColor: '#FFD600',
                    color: '#000000',
                    fontSize: '1rem',
                  }}
                >
                  <span className="lg:text-lg">{t('success.sendWhatsApp')}</span>
                  <span className="text-xl lg:text-2xl">📲</span>
                </motion.button>

                {/* Helper Text */}
                <p className="text-xs mt-3 lg:mt-4 text-muted-foreground font-medium">
                  {t('success.whatsAppHint')}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}