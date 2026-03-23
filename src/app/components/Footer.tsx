import { useTranslation } from 'react-i18next';
import { Instagram, Facebook, Mail, Phone } from 'lucide-react';
import { useCompanyInfo } from '../hooks/useCompanyInfo';

export function Footer() {
  const { t } = useTranslation();
  const { info } = useCompanyInfo();

  return (
    <footer className="w-full bg-card border-t border-border py-8 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl mb-3 font-bold text-foreground">
              CYF Custom
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
              {t('footer.brandDescription')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-bold text-foreground">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="/#productos" className="text-sm sm:text-base text-muted-foreground font-medium transition-colors hover:text-primary">
                  {t('footer.products')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="mb-4 font-bold text-foreground">
              {t('footer.contact')}
            </h4>
            <div className="space-y-3 mb-4">
              <a href={`mailto:${info.email}`} className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground font-medium transition-colors hover:text-primary">
                <Mail size={18} />
                {info.email}
              </a>
              <a href={`https://wa.me/${info.phone}`} className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground font-medium transition-colors hover:text-primary">
                <Phone size={18} />
                +{info.phone.slice(0, 2)} ({info.phone.slice(2, 5)}) {info.phone.slice(5, 8)}-{info.phone.slice(8)}
              </a>
            </div>

            {/* Social Media */}
            <div className="flex gap-3">
              <a
                href={info.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-muted transition-all hover:scale-110 hover:bg-accent"
                aria-label="Instagram"
              >
                <Instagram size={20} style={{ color: 'var(--vibrant-orange)' }} />
              </a>
              <a
                href={info.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-muted transition-all hover:scale-110 hover:bg-accent"
                aria-label="Facebook"
              >
                <Facebook size={20} style={{ color: 'var(--electric-blue)' }} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs sm:text-sm text-center sm:text-left text-muted-foreground">
              {t('footer.copyright')}
            </p>
            <div className="flex gap-4 text-xs sm:text-sm text-muted-foreground">
              <span>{t('footer.privacyPolicy')}</span>
              <span>{t('footer.termsOfService')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}