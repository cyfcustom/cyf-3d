import { useState } from 'react';
import { useAtom } from 'jotai';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { showSuccessModalAtom, designPreviewAtom, productConfigAtom } from '../store/atoms';
import { useCompanyInfo } from '../hooks/useCompanyInfo';
import { supabase } from '../lib/supabase';

/** Convert a base64 data URL to a File object */
function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new File([arr], filename, { type: mime });
}

export function SuccessModal() {
  const [showModal, setShowModal] = useAtom(showSuccessModalAtom);
  const [designPreview] = useAtom(designPreviewAtom);
  const [productConfig] = useAtom(productConfigAtom);
  const { t } = useTranslation('configurator');
  const { info } = useCompanyInfo();
  const [sending, setSending] = useState(false);

  const handleWhatsAppOrder = async () => {
    setSending(true);

    try {
      // 1. Upload screenshot if available
      let screenshotUrl: string | undefined;
      if (designPreview) {
        const file = dataUrlToFile(designPreview, `cyf-diseno-${Date.now()}.png`);
        const path = `orders/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`;
        const { error: uploadErr } = await supabase.storage
          .from('order-screenshots')
          .upload(path, file, { contentType: 'image/png' });

        if (!uploadErr) {
          const { data: urlData } = supabase.storage
            .from('order-screenshots')
            .getPublicUrl(path);
          screenshotUrl = urlData.publicUrl;
        }
      }

      // 2. Create order in database
      const productName = productConfig.baseColorName || 'Producto';
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          product_name: productName,
          product_color: productConfig.baseColor,
          product_size: productConfig.size,
          screenshot_url: screenshotUrl || null,
        })
        .select('id')
        .single();

      if (orderErr) throw orderErr;

      // 3. Build WhatsApp message with order link
      const orderUrl = `${window.location.origin}/order/${order.id}`;
      const message = `${info.whatsapp_message_template}\n\nQuiero hacer un pedido:\n📦 Producto: ${productName}\n🎨 Color: ${productConfig.baseColor}\n📐 Talla: ${productConfig.size}\n\n🔗 Ver mi diseño: ${orderUrl}\n\n¡Gracias!`;

      const whatsappUrl = `https://wa.me/${info.phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      setShowModal(false);
    } catch (err) {
      console.error('Failed to create order:', err);
      toast.error('Error creando el pedido. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
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
                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mx-auto mb-4 lg:mb-6 w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#10B981' }}
                >
                  <Check size={32} className="lg:w-10 lg:h-10" color="white" strokeWidth={3} />
                </motion.div>

                {/* Confetti */}
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
                    {productConfig.baseColorName || t('success.product')} • {t('success.size')}{' '}
                    {productConfig.size}
                  </p>
                </div>

                {/* CTA Button - WhatsApp */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsAppOrder}
                  disabled={sending}
                  className="w-full py-4 lg:py-5 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl touch-manipulation font-bold disabled:opacity-70"
                  style={{
                    backgroundColor: '#FFD600',
                    color: '#000000',
                    fontSize: '1rem',
                  }}
                >
                  {sending ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span className="lg:text-lg">Creando pedido...</span>
                    </>
                  ) : (
                    <>
                      <span className="lg:text-lg">{t('success.sendWhatsApp')}</span>
                      <span className="text-xl lg:text-2xl">📲</span>
                    </>
                  )}
                </motion.button>

                {/* Helper Text */}
                <p className="text-xs mt-3 lg:mt-4 text-muted-foreground font-medium">
                  Se crear&aacute; un pedido con tu dise&ntilde;o y se enviar&aacute; el link por WhatsApp
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
