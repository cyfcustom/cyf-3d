import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/components/ui/accordion';
import { Button } from '@/app/components/ui/button';

export function FAQModule(){
  const openAll = () => {
    const root = document.querySelector('[data-slot="accordion"]');
    if(!root) return;
    const triggers = Array.from(root.querySelectorAll('[data-slot="accordion-trigger"]')) as HTMLElement[];
    triggers.forEach(t => t.click());
  };

  return (
    <div className="space-y-6" id="faq">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">Módulo 12</p>
        <h2 className="text-2xl font-bold">Preguntas frecuentes</h2>
        <p className="text-sm text-muted-foreground">Respuestas rápidas sobre los módulos, cálculos y flujo de uso.</p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={openAll}>Expandir todo</Button>
      </div>

      <Accordion type="multiple" className="bg-card border border-border rounded-2xl shadow-sm p-2">
        <AccordionItem value="nav">
          <AccordionTrigger>
            ¿Cómo navego entre módulos?
          </AccordionTrigger>
          <AccordionContent>
            Usa el menú lateral o móvil para cambiar de vista. Cada sección presenta su propio conjunto de entradas y resultados.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="resumen">
          <AccordionTrigger>
            ¿Qué módulos se incluyen en el Resumen por defecto?
          </AccordionTrigger>
          <AccordionContent>
            En la vista "Resumen general" puedes activar/desactivar módulos individualmente. Por defecto, <strong>Envíos</strong> y <strong>DTF</strong> están apagados; el resto aparecen activos. También puedes copiar o imprimir el resumen.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="envios">
          <AccordionTrigger>
            ¿Cómo se calcula Envíos?
          </AccordionTrigger>
          <AccordionContent>
            La mensajería se calcula como <em>tarifa base</em> + (<em>km</em> × <em>tarifa/km</em>) + (<em>kg</em> × <em>tarifa/kg</em>). Los extras incluyen embalaje, manejo de frágil y un seguro opcional (porcentaje aplicado sobre mensajería + extras), además de "otros". Los valores se guardan en el navegador.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="conversor">
          <AccordionTrigger>
            ¿Qué ofrece el Conversor de Unidades?
          </AccordionTrigger>
          <AccordionContent>
            Convierte longitud, área, peso y temperatura, además de cálculos de DPI para pasar de tamaño físico (cm) a píxeles y viceversa. Los resultados usan 4 decimales y coma como separador.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="personalizable">
          <AccordionTrigger>
            ¿Cómo funciona el módulo de Producto personalizable?
          </AccordionTrigger>
          <AccordionContent>
            Define líneas de <strong>costos directos</strong> (con cantidad, precio y costo utilizado), <strong>depreciación</strong> (vida útil o capacidad/mes), <strong>indirectos</strong> por unidad, y <strong>mano de obra</strong> por unidad. Aplica <strong>Ganancia</strong> (Margen o Markup) e <strong>Impuestos</strong>, y obtén el <strong>Precio de Venta</strong>. Puedes multiplicar el total por una cantidad (solo vista).
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="persistencia">
          <AccordionTrigger>
            ¿Se guarda mi configuración?
          </AccordionTrigger>
          <AccordionContent>
            Algunos módulos, como Envíos, persisten su estado en <em>localStorage</em> para que tus valores se mantengan entre sesiones en el mismo navegador.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="format">
          <AccordionTrigger>
            ¿Qué formato decimal usan los resultados?
          </AccordionTrigger>
          <AccordionContent>
            Se muestra estilo europeo en varios resultados (coma decimal). Las entradas aceptan punto o coma y se normalizan internamente.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="reset">
          <AccordionTrigger>
            ¿Cómo restablezco un módulo?
          </AccordionTrigger>
          <AccordionContent>
            Cada módulo incluye un botón de <strong>Reset</strong> para volver a los valores por defecto del cálculo.
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
}
