'use client'

import { useState, useEffect, FormEvent } from 'react';
import { Currency, fetchCurrencies, fetchConversionRates, ConversionResult } from '../../services/currencyService';
import { formatDuration, delay } from '../../lib/utils';
import { Card, CardHeader, Button, ErrorMessage, FadeIn, Spinner } from '../../components/ui';

export default function CurrencyConverter() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('1000');
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Fetch available currencies on component mount
  useEffect(() => {
    async function loadCurrencies() {
      try {
        const currencyData = await fetchCurrencies();
        setCurrencies(currencyData);
      } catch (error) {
        setError('Failed to load currencies. Please try again later.');
        console.error('Error fetching currencies:', error);
      }
    }

    loadCurrencies();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setShowResult(false);

    try {
      const result = await fetchConversionRates(fromCurrency, toCurrency, amount);
      setConversionResult(result);
      
      // Add a small delay before showing the result for smooth fade-in
      await delay(50);
      setShowResult(true);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Error fetching conversion rates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent selecting the same currency in both dropdowns
  const handleFromCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFromCurrency = e.target.value;
    setFromCurrency(newFromCurrency);
    
    // If the new "from" currency is the same as the "to" currency,
    // change the "to" currency to something else
    if (newFromCurrency === toCurrency) {
      // Find a different currency to use
      const differentCurrency = currencies.find(c => c.code !== newFromCurrency)?.code || '';
      if (differentCurrency) {
        setToCurrency(differentCurrency);
      }
    }
  };

  const handleToCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newToCurrency = e.target.value;
    setToCurrency(newToCurrency);
    
    // If the new "to" currency is the same as the "from" currency,
    // change the "from" currency to something else
    if (newToCurrency === fromCurrency) {
      // Find a different currency to use
      const differentCurrency = currencies.find(c => c.code !== newToCurrency)?.code || '';
      if (differentCurrency) {
        setFromCurrency(differentCurrency);
      }
    }
  };

  // Extract Wise provider data from the conversion result
  const wiseProvider = conversionResult?.providers?.find(
    (provider) => provider.name === 'Wise'
  );

  return (
    <Card className="max-w-md w-full">
      <CardHeader 
        title="Currency Converter" 
        subtitle="Fast, secure international transfers"
      />
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <input
                type="number"
                name="amount"
                id="amount"
                step="0.01"
                min="0.01"
                className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder="1000.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* Currency Selectors */}
          <div className="grid grid-cols-5 gap-2 items-center">
            <div className="col-span-2">
              <label htmlFor="fromCurrency" className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <select
                id="fromCurrency"
                name="fromCurrency"
                className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm border"
                value={fromCurrency}
                onChange={handleFromCurrencyChange}
                required
              >
                {currencies.map((currency) => (
                  <option key={`from-${currency.code}`} value={currency.code}>
                    {currency.flag} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-center items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            
            <div className="col-span-2">
              <label htmlFor="toCurrency" className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <select
                id="toCurrency"
                name="toCurrency"
                className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm border"
                value={toCurrency}
                onChange={handleToCurrencyChange}
                required
              >
                {currencies.map((currency) => (
                  <option key={`to-${currency.code}`} value={currency.code}>
                    {currency.flag} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Submit Button */}
          <div>
            <Button 
              type="submit" 
              isLoading={isLoading}
              disabled={isLoading} 
              className="w-full py-3"
            >
              Convert
            </Button>
          </div>
        </form>

        {/* Error Message */}
        {error && <ErrorMessage message={error} />}

        {/* Conversion Result */}
        {wiseProvider && (
          <FadeIn show={showResult}>
            <div className="mt-6">
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-500">You send</span>
                    <p className="text-lg font-semibold">
                      {wiseProvider.sourceAmount} {fromCurrency}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Recipient gets</span>
                    <p className="text-lg font-semibold">
                      {wiseProvider.targetAmount} {toCurrency}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-500">Exchange rate</span>
                    </div>
                    <div className="font-medium">
                      1 {fromCurrency} = {wiseProvider.quotes[0].rate} {toCurrency}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mt-2">
                    <div>
                      <span className="text-gray-500">Fee</span>
                    </div>
                    <div className="font-medium">
                      {wiseProvider.quotes[0].fee || '0'} {fromCurrency}
                    </div>
                  </div>

                  {wiseProvider.quotes[0].deliveryEstimation?.duration?.min && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <div>
                        <span className="text-gray-500">Estimated delivery</span>
                      </div>
                      <div className="font-medium">
                        {formatDuration(wiseProvider.quotes[0].deliveryEstimation.duration.min)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </Card>
  );
}
