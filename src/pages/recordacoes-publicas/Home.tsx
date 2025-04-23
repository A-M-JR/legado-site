
import React from 'react';
import { useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import About from '../../components/About';
import Features from '../../components/Features';
import Testimonials from '../../components/Testimonials';
import Partners from '../../components/Partners';
import FAQ from '../../components/FAQ';
import Contact from '../../components/Contact';
import CTA from '../../components/CTA';
import Footer from '../../components/Footer';

export default function Home() {
    useEffect(() => {
      const updateMetaTags = () => {
        document.title = "Legado - Preservando Memórias";
  
        let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.name = 'description';
          document.head.appendChild(metaDescription);
        }
  
        if (metaDescription) {
          metaDescription.content =
            'Legado: Aplicativo para empresas de planos funerários, oferecendo gerenciamento de recordações dos entes queridos que já se foram.';
        }
      };
  
      updateMetaTags();
    }, []);
  
    return (
      <div className="font-sans">
        <Navbar />
        <Hero />
        <About />
        <Features />
        <Testimonials />
        <FAQ />
        <Partners />
        <CTA />
        <Contact />
        <Footer />
      </div>
    );
  }
