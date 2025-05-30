import React from 'react';
import banner from '../assets/tela-frase.png';

export default function Hero() {
  return (
    <div className="relative w-full">
      <img
        src={banner}
        alt="Legado Banner"
        className="w-full h-auto object-cover"
      />
    </div>
  );
};
