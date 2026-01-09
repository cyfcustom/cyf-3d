import { Instagram, Facebook, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-card border-t border-border py-8 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-2xl mb-3 font-bold text-foreground">
              CYF Customs
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
              Personalización de productos de alta calidad en Venezuela. 
              Transforma tus ideas en productos únicos.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-bold text-foreground">
              Enlaces Rápidos
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#productos" className="text-sm sm:text-base text-muted-foreground font-medium transition-colors hover:text-primary">
                  Productos
                </a>
              </li>
              <li>
                <a href="#mis-disenos" className="text-sm sm:text-base text-muted-foreground font-medium transition-colors hover:text-primary">
                  Mis Diseños
                </a>
              </li>
              <li>
                <a href="#como-funciona" className="text-sm sm:text-base text-muted-foreground font-medium transition-colors hover:text-primary">
                  Cómo Funciona
                </a>
              </li>
              <li>
                <a href="#preguntas" className="text-sm sm:text-base text-muted-foreground font-medium transition-colors hover:text-primary">
                  Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="mb-4 font-bold text-foreground">
              Contacto
            </h4>
            <div className="space-y-3 mb-4">
              <a href="mailto:contacto@cyfcustoms.com" className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground font-medium transition-colors hover:text-primary">
                <Mail size={18} />
                contacto@cyfcustoms.com
              </a>
              <a href="tel:+584124553107" className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground font-medium transition-colors hover:text-primary">
                <Phone size={18} />
                +58 412-4553107
              </a>
            </div>
            
            {/* Social Media */}
            <div className="flex gap-3">
              <a 
                href="#instagram" 
                className="p-2.5 rounded-lg bg-muted transition-all hover:scale-110 hover:bg-accent"
              >
                <Instagram size={20} style={{ color: 'var(--vibrant-orange)' }} />
              </a>
              <a 
                href="#facebook" 
                className="p-2.5 rounded-lg bg-muted transition-all hover:scale-110 hover:bg-accent"
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
              © 2024 CYF Customs. Todos los derechos reservados.
            </p>
            <div className="flex gap-4 text-xs sm:text-sm">
              <a href="#privacidad" className="text-muted-foreground transition-colors hover:text-primary">
                Política de Privacidad
              </a>
              <a href="#terminos" className="text-muted-foreground transition-colors hover:text-primary">
                Términos de Servicio
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}