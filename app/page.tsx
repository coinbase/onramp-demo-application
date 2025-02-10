import dynamic from 'next/dynamic';

const DynamicCryptoRampWrapper = dynamic(
  () => import('./CryptoRampWrapper').then((mod) => mod.CryptoRampWrapper),
  { ssr: false }
);

export default function Home() {
  return <DynamicCryptoRampWrapper />;
}
