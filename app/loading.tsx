import { Skeleton } from '@/components/ui/skeleton';
import { getLocale } from '@/i18n/locale';
import { getLocaleMessages } from '@/i18n/i18n';

const LoadingPage = async () => {
  const lang = await getLocale();
  const t = await getLocaleMessages(lang, 'common');

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-background">
      <div className="w-full max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex gap-3 pt-2">
                <Skeleton className="h-10 w-20 rounded" />
                <Skeleton className="h-10 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
