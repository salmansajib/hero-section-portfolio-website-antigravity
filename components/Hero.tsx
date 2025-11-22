import DotAnimation from './DotAnimation';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative flex items-center min-h-screen overflow-hidden bg-background">
      <DotAnimation />
      
      <div className="relative z-10 flex flex-col items-start text-left px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="mb-4 inline-block">
          <p className="text-xl md:text-2xl font-medium text-foreground/80 mb-2">
            Hey, I'm Salman Farshi Shojeeb
          </p>
          <div className="h-1 w-24 bg-blue-500 rounded-full"></div>
        </div>
        
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground mb-8 leading-[0.9]">
          Frontend <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Developer</span>
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link 
            href="#portfolio" 
            className="px-8 py-3 rounded-full bg-foreground text-background font-semibold hover:opacity-90 transition-all transform hover:scale-105"
          >
            My Portfolio
          </Link>
          <Link 
            href="#contact" 
            className="px-8 py-3 rounded-full border border-foreground/20 text-foreground font-semibold hover:bg-foreground/10 transition-all transform hover:scale-105 backdrop-blur-sm"
          >
            Contact Me
          </Link>
        </div>
      </div>
    </section>
  );
}
