import {
  Calculator,
  Printer,
  Tags,
  Droplet,
  FileText,
  Package,
  Sparkles,
  Truck,
  Settings,
  BarChart3,
  HelpCircle,
  ArrowRight,
  Package2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface CalculatorCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

function CalculatorCard({ title, description, icon, color, onClick }: CalculatorCardProps) {
  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-primary/50"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-xl ${color} transition-transform group-hover:scale-110`}>
            {icon}
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

interface Category {
  id: string;
  title: string;
  description: string;
  calculators: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }[];
}

interface CategoryDef {
  id: string;
  titleKey: string;
  descKey: string;
  calculators: {
    id: string;
    moduleKey: string;
    icon: React.ReactNode;
    color: string;
  }[];
}

const categoryDefs: CategoryDef[] = [
  {
    id: 'printing',
    titleKey: 'categories.printing',
    descKey: 'categories.printingDesc',
    calculators: [
      { id: 'vinyl', moduleKey: 'modules.vinyl', icon: <Printer className="w-5 h-5 text-white" />, color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
      { id: 'sublimation', moduleKey: 'modules.sublimation', icon: <Droplet className="w-5 h-5 text-white" />, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
      { id: 'dtf', moduleKey: 'modules.dtf', icon: <Sparkles className="w-5 h-5 text-white" />, color: 'bg-gradient-to-br from-pink-500 to-pink-600' },
      { id: 'labels', moduleKey: 'modules.labels', icon: <Tags className="w-5 h-5 text-white" />, color: 'bg-gradient-to-br from-green-500 to-green-600' },
    ],
  },
  {
    id: 'products',
    titleKey: 'categories.physical',
    descKey: 'categories.physicalDesc',
    calculators: [
      { id: 'stationery', moduleKey: 'modules.stationery', icon: <FileText className="w-5 h-5 text-white" />, color: 'bg-gradient-to-br from-orange-500 to-orange-600' },
      { id: 'packaging', moduleKey: 'modules.packaging', icon: <Package className="w-5 h-5 text-white" />, color: 'bg-gradient-to-br from-amber-500 to-amber-600' },
      { id: 'spheres', moduleKey: 'modules.spheres', icon: <Sparkles className="w-5 h-5 text-white" />, color: 'bg-gradient-to-br from-red-500 to-red-600' },
    ],
  },
  {
    id: 'complementary',
    titleKey: 'categories.complementary',
    descKey: 'categories.complementaryDesc',
    calculators: [
      { id: 'shipping', moduleKey: 'modules.shipping', icon: <Truck className="w-5 h-5 text-white" />, color: 'bg-gradient-to-br from-indigo-500 to-indigo-600' },
      { id: 'customizable', moduleKey: 'modules.custom', icon: <Package2 className="w-5 h-5 text-white" />, color: 'bg-gradient-to-br from-cyan-500 to-cyan-600' },
    ],
  },
  {
    id: 'tools',
    titleKey: 'categories.tools',
    descKey: 'categories.toolsDesc',
    calculators: [
      { id: 'converter', moduleKey: 'modules.converter', icon: <Settings className="w-5 h-5 text-white" />, color: 'bg-gradient-to-br from-slate-500 to-slate-600' },
      { id: 'summary', moduleKey: 'modules.summary', icon: <BarChart3 className="w-5 h-5 text-white" />, color: 'bg-gradient-to-br from-teal-500 to-teal-600' },
      { id: 'faq', moduleKey: 'modules.faq', icon: <HelpCircle className="w-5 h-5 text-white" />, color: 'bg-gradient-to-br from-violet-500 to-violet-600' },
    ],
  },
];

interface CalculatorDashboardProps {
  onSelectCalculator: (id: string) => void;
}

export function CalculatorDashboard({ onSelectCalculator }: CalculatorDashboardProps) {
  const { t } = useTranslation(['calculator', 'common']);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="outline" className="mb-2">
          <Calculator className="w-3 h-3 mr-1" />
          {t('calculator:dashboard.title')}
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">
          {t('calculator:dashboard.heading')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('calculator:dashboard.description')}
        </p>
      </div>

      {/* Categories */}
      {categoryDefs.map((category, idx) => (
        <div
          key={category.id}
          className="space-y-4 animate-in slide-in-from-bottom duration-500"
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{t(`calculator:${category.titleKey}`)}</h2>
              <p className="text-sm text-muted-foreground text-center">
                {t(`calculator:${category.descKey}`)}
              </p>
            </div>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {category.calculators.map((calc) => (
              <CalculatorCard
                key={calc.id}
                id={calc.id}
                title={t(`calculator:${calc.moduleKey}.name`)}
                description={t(`calculator:${calc.moduleKey}.description`)}
                icon={calc.icon}
                color={calc.color}
                onClick={() => onSelectCalculator(calc.id)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t">
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold text-primary">12</div>
          <p className="text-sm text-muted-foreground">{t('calculator:dashboard.stats.available')}</p>
        </div>
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold text-primary">4</div>
          <p className="text-sm text-muted-foreground">{t('calculator:dashboard.stats.categories')}</p>
        </div>
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold text-primary">∞</div>
          <p className="text-sm text-muted-foreground">{t('calculator:dashboard.stats.possibilities')}</p>
        </div>
      </div>
    </div>
  );
}
