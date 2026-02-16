import { useTranslation, Trans } from 'react-i18next';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/components/ui/accordion';
import { Button } from '@/app/components/ui/button';

export function FAQModule(){
  const { t } = useTranslation('calculator');
  const { t: tCommon } = useTranslation('common');

  const openAll = () => {
    const root = document.querySelector('[data-slot="accordion"]');
    if(!root) return;
    const triggers = Array.from(root.querySelectorAll('[data-slot="accordion-trigger"]')) as HTMLElement[];
    triggers.forEach(t => t.click());
  };

  const faqItems = [
    { value: 'nav', question: 'navigate', answer: 'navigateAnswer' },
    { value: 'resumen', question: 'summaryModules', answer: 'summaryModulesAnswer' },
    { value: 'envios', question: 'shippingCalc', answer: 'shippingCalcAnswer' },
    { value: 'conversor', question: 'converterOffer', answer: 'converterOfferAnswer' },
    { value: 'personalizable', question: 'customModule', answer: 'customModuleAnswer' },
    { value: 'persistencia', question: 'savedConfig', answer: 'savedConfigAnswer' },
    { value: 'format', question: 'decimalFormat', answer: 'decimalFormatAnswer' },
    { value: 'reset', question: 'resetModule', answer: 'resetModuleAnswer' },
  ];

  return (
    <div className="space-y-6" id="faq">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">{t('faq.moduleLabel')}</p>
        <h2 className="text-2xl font-bold">{t('faq.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('faq.description')}</p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={openAll}>{tCommon('actions.expandAll')}</Button>
      </div>

      <Accordion type="multiple" className="bg-card border border-border rounded-2xl shadow-sm p-2">
        {faqItems.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>
              {t(`faq.questions.${item.question}`)}
            </AccordionTrigger>
            <AccordionContent>
              <span dangerouslySetInnerHTML={{ __html: t(`faq.questions.${item.answer}`) }} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
