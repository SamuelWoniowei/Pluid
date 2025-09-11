"use client";
import React, { useState, useEffect } from "react";

export default function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputAmount, setInputAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [currencies, setCurrencies] = useState([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(true);

  // Fetch available currencies on component mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      setCurrenciesLoading(true);
      try {
        const response = await fetch('https://api.wise.com/v1/currencies');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch currencies: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Map the currency data to our format
        const formattedCurrencies = data.map(currency => {
          // Use country code to generate flag emoji (each flag is made of 2 regional indicator symbols)
          const countryCode = currency.code.slice(0, 2);
          const flagEmoji = countryCode
            .toUpperCase()
            .replace(/./g, char => 
              String.fromCodePoint(char.charCodeAt(0) + 127397)
            );
          
          return {
            code: currency.code,
            name: currency.name,
            flag: flagEmoji
          };
        });
        
        setCurrencies(formattedCurrencies);
        
        // If default currencies aren't available, set first two currencies as defaults
        if (formattedCurrencies.length >= 2) {
          const hasUSD = formattedCurrencies.some(c => c.code === "USD");
          const hasEUR = formattedCurrencies.some(c => c.code === "EUR");
          
          if (!hasUSD) {
            setFromCurrency(formattedCurrencies[0].code);
          }
          
          if (!hasEUR) {
            const secondOption = formattedCurrencies.find(c => c.code !== fromCurrency);
            if (secondOption) setToCurrency(secondOption.code);
          }
        }
      } catch (err) {
        console.error("Error fetching currencies:", err);
        // Fallback to default currencies if API fails
        setCurrencies([
          { code: "USD", flag: "🇺🇸", name: "US Dollar" },
          { code: "EUR", flag: "🇪🇺", name: "Euro" },
          { code: "GBP", flag: "🇬🇧", name: "British Pound" },
          { code: "JPY", flag: "🇯🇵", name: "Japanese Yen" },
          { code: "CAD", flag: "🇨🇦", name: "Canadian Dollar" },
          { code: "AUD", flag: "🇦🇺", name: "Australian Dollar" },
        ]);
      } finally {
        setCurrenciesLoading(false);
      }
    };
    
    fetchCurrencies();
  }, []);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const amount = e.target.amount.value;
    
    // Store values for display
    setInputAmount(amount);
    
    console.log(fromCurrency, toCurrency, amount);
    try {
      const response = await fetch(
        `https://api.wise.com/v4/comparisons/?sourceCurrency=${fromCurrency}&targetCurrency=${toCurrency}&sendAmount=${amount}`,
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.providers || data.providers.length === 0) {
        throw new Error('No conversion data available');
      }
      
      setResult(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching conversion:", error);
      setError(error.message || "Failed to fetch conversion rates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to format ISO 8601 duration like "PT20H8M16.305111S" to "20h 8m"
  function formatDuration(isoDuration) {
    if (!isoDuration) return "Unknown";
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
    if (!match) return "Unknown";
    
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours}h ${minutes > 0 ? minutes + 'm' : ''}`;
    } else {
      return `${minutes}m`;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Widget Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Currency Converter</h1>
          <p className="text-gray-600 text-sm">Get real-time exchange rates</p>
        </div>

        <form className="space-y-6" onSubmit={handleFormSubmit}>
          {/* Amount Input */}
          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <input 
              type="number" 
              id="amount" 
              name="amount"
              className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
              placeholder="Enter amount"
              required
              min="0"
              step="0.01"
            />
          </div>

          {/* Currency Selection */}
          <div className="grid grid-cols-1 gap-4">"
            {/* From Currency */}
            <div className="space-y-2">
              <label htmlFor="fromCurrency" className="block text-sm font-medium text-gray-700">
                From
              </label>
              <select 
                id="fromCurrency" 
                name="fromCurrency"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                disabled={currenciesLoading}
              >
                {currenciesLoading ? (
                  <option>Loading currencies...</option>
                ) : (
                  currencies
                    .filter(currency => currency.code !== toCurrency)
                    .map(currency => (
                      <option key={`from-${currency.code}`} value={currency.code}>
                        {currency.flag} {currency.code} - {currency.name}
                      </option>
                    ))
                )}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                type="button"
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                onClick={() => {
                  const tempFrom = fromCurrency;
                  setFromCurrency(toCurrency);
                  setToCurrency(tempFrom);
                }}
                disabled={currenciesLoading}
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            </div>

            {/* To Currency */}
            <div className="space-y-2">
              <label htmlFor="toCurrency" className="block text-sm font-medium text-gray-700">
                To
              </label>
              <select 
                id="toCurrency" 
                name="toCurrency"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full p-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                disabled={currenciesLoading}
              >
                {currenciesLoading ? (
                  <option>Loading currencies...</option>
                ) : (
                  currencies
                    .filter(currency => currency.code !== fromCurrency)
                    .map(currency => (
                      <option key={`to-${currency.code}`} value={currency.code}>
                        {currency.flag} {currency.code} - {currency.name}
                      </option>
                    ))
                )}
              </select>
            </div>
          </div>

          {/* Convert Button */}
          <button
            type="submit"
            disabled={loading || currenciesLoading}
            className="w-full p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Converting...</span>
              </>
            ) : currenciesLoading ? (
              <span>Loading currencies...</span>
            ) : (
              <span>Convert Currency</span>
            )}
          </button>
        </form>

        {/* Error State */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 text-sm font-medium">Error</p>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-6">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="font-semibold text-green-800">Conversion Results</h2>
            </div>
            
            {/* Conversion Summary */}
            <div className="mb-4 text-center p-4 bg-white rounded-lg border border-green-200">
              <p className="text-gray-600 text-sm mb-1">Converting</p>
              <p className="text-xl font-bold text-gray-800">
                {inputAmount} {fromCurrency} → {toCurrency}
              </p>
            </div>

            <div className="space-y-3">
              {result.providers.map((item, index) => {
                const quote = item.quotes[0];
                const convertedAmount = (parseFloat(inputAmount) * parseFloat(quote.rate)).toFixed(2);
                const arrival = quote.deliveryEstimation?.duration?.min
                  ? formatDuration(quote.deliveryEstimation.duration.min)
                  : "N/A";
                
                return (
                  <div key={index} className="bg-white p-4 rounded-lg border border-green-200">
                    {/* Provider Header */}
                    <div className="mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                      {item.logos?.normal?.svgUrl && (
                        <img 
                          src={item.logos.normal.svgUrl} 
                          alt={item.name} 
                          className="w-20 h-10" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (item.logos?.normal?.pngUrl) {
                              target.src = item.logos.normal.pngUrl;
                            }
                          }}
                        />
                      )}
                    </div>
                    
                    {/* Converted Amount - Main Display */}
                    <div className="mb-3 text-center py-2">
                      <p className="text-gray-600 text-sm mb-1">You will receive</p>
                      <p className="text-2xl font-bold text-green-600">
                        {convertedAmount} {toCurrency}
                      </p>
                    </div>
                    
                    {/* Additional Details */}
                    <div className="grid grid-cols-3 gap-4 text-sm pt-2 border-t border-gray-100">
                      <div>
                        <p className="text-gray-500">Exchange Rate</p>
                        <p className="font-medium text-gray-700">
                          {parseFloat(quote.rate).toFixed(4)} 
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Fee</p>
                        <p className="font-medium text-gray-700">
                          {quote.fee ? `${quote.fee} ${fromCurrency}` : 'Free'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Est. Arrival</p>
                        <p className="font-medium text-gray-700">
                          {arrival}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
