import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import Image from 'next/image';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500'],
});

export const metadata: Metadata = {
  title: 'Reduza Custos | Pague Menos No Seu Crédito Habitação',
  description: 'Análise gratuita e sem compromisso para renegociar o seu crédito habitação. A sua poupança começa hoje com especialistas autorizados.',
};

export const viewport = {
  themeColor: '#0F3460',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT" className={`${playfair.variable} ${dmSans.variable}`}>
      <body suppressHydrationWarning className="bg-[#0F3460] text-white font-body selection:bg-[#E8A020] selection:text-white">
        <div id="loader" className="fixed inset-0 z-[99999] bg-[#0F3460] flex flex-col items-center justify-center">
          <div className="loader-logo mb-6">
            <Image src="https://i.imgur.com/U35lnwD.png" width={180} height={60} alt="Reduza Custos" className="h-[60px] w-auto" />
          </div>
          <div className="loader-bar w-48 h-[2px] bg-white/10 overflow-hidden relative">
            <div className="loader-progress w-full h-full bg-[#E8A020] origin-left scale-x-0"></div>
          </div>
          <div className="loader-percent mt-4 text-[#8892A4] font-mono text-sm tracking-widest">0%</div>
        </div>
        {/* Grain Overlay */}
        <div className="pointer-events-none fixed inset-0 z-[9990] opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }}></div>
        {/* Custom Cursors */}
        <div id="cursor" className="hidden md:block w-2 h-2 bg-[#E8A020] rounded-full fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 opacity-0"></div>
        <div id="cursor-follower" className="hidden md:block w-8 h-8 border border-[#E8A020] rounded-full fixed pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 opacity-0 will-change-transform"></div>
        {/* Scroll Progress Bar */}
        <div className="scroll-progress fixed top-0 left-0 h-[2px] bg-[#E8A020] z-[9999] origin-left scale-x-0 w-full"></div>
        {children}
      </body>
    </html>
  );
}
