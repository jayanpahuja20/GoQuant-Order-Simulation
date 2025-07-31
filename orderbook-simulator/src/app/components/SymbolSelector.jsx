import React, { useState, useEffect, useRef } from 'react';
import { symbolsWithLogos } from '../constants/constants';

const findSymbol = (ticker) => {
  return symbolsWithLogos.find(symbol => symbol.ticker === ticker) || null;
};


const SymbolSelector = ({ selectedSymbol, onSymbolChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Find the full object for the selected symbol
  const currentSymbol = findSymbol(selectedSymbol);

  // This effect handles closing the dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (ticker) => {
    onSymbolChange(ticker);
    setIsOpen(false); // Close dropdown after selection
  };

  return (
    // Use a ref to detect clicks outside
    <div ref={wrapperRef} className="relative w-48"> 
      <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
      
      {/* 1. The "fake" select box button */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-left"
      >
        {currentSymbol ? (
          <>
            <img src={currentSymbol.logo} alt={currentSymbol.name} className="w-6 h-6 mr-2"/>
            <span className="font-semibold">{currentSymbol.ticker}</span>
          </>
        ) : (
          <span>Select a symbol</span>
        )}
        {/* Dropdown arrow */}
        <svg className={`w-5 h-5 ml-auto transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {/* 2. The dropdown panel with options */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
          <ul>
            {symbolsWithLogos.map(symbol => (
              <li 
                key={symbol.ticker} 
                onClick={() => handleSelect(symbol.ticker)}
                className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
              >
                <img src={symbol.logo} alt={symbol.name} className="w-6 h-6 mr-2"/>
                <span className="font-semibold mr-2">{symbol.ticker}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SymbolSelector;