import Image from 'next/image';
import loader from '@/assets/loader.gif';
import { getLocale } from '@/i18n/locale';
import { getLocaleMessages } from '@/i18n/i18n';

const LoadingPage = async () => {
  const lang = await getLocale();
  const t = await getLocaleMessages(lang, 'common');
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
      }}
    >
      <Image src={loader} height={150} width={150} alt={t.loading} />
    </div>
  );
};

export default LoadingPage;
