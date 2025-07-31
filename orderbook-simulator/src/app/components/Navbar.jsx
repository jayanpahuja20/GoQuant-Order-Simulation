'use client';

import React from 'react';
import Image from 'next/image';

const navItems = [
  { href: '#orderbook', label: 'Orderbook' },
  { href: '#simulation', label: 'Simulator' },
  { href: '#analysis', label: 'Impact Analysis' },
  { href: '#status', label: 'Connection Status' },
  { href: '#logs', label: 'Logs & Metrics' },
  { href: '#api', label: 'API Guide' },
];

const Navbar = () => {
  const handleScroll = (e, href) => {
    e.preventDefault();
    // Find the target element using its ID
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav className="sticky top-2 z-50 bg-white/80 backdrop-blur-lg shadow-lg mb-6 rounded-xl mx-auto max-w-7xl">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex-shrink-0 flex items-center">
            <Image
              src="https://ik.imagekit.io/j0xinhiam/goquant_logo.png?updatedAt=1753960225261"
              alt="Company Logo"
              width={48}
              height={48}
              className="rounded-full"
            />
            <span className="font-bold text-gray-800 ml-3 hidden sm:block">GoQuant OrderBook</span>
          </div>

          <div className="flex items-baseline space-x-1 sm:space-x-4 overflow-x-auto py-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleScroll(e, item.href)}
                className="text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors cursor-pointer"
              >
                {item.label}
              </a>
            ))}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;