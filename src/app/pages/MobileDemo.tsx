import { lazy, Suspense } from 'react';
import { MobileFrame } from '../components/MobileFrame';

const ConfiguratorWorkspace = lazy(() =>
  import('../components/ConfiguratorWorkspace').then(m => ({ default: m.ConfiguratorWorkspace }))
);

export function MobileDemo() {
  return (
    <MobileFrame>
      <Suspense fallback={
        <div className="h-full flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ConfiguratorWorkspace />
      </Suspense>
    </MobileFrame>
  );
}
