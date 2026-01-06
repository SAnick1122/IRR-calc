import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Plus, Trash2 } from 'lucide-react';

export default function IRRCalculator() {
  const [initialInvestment, setInitialInvestment] = useState(-100000);
  const [cashFlows, setCashFlows] = useState([25000, 30000, 35000, 40000, 45000]);
  
  // Calculate IRR using Newton-Raphson method
  const calculateIRR = (flows) => {
    const allFlows = [initialInvestment, ...flows];
    let rate = 0.1; // Initial guess
    const maxIterations = 1000;
    const tolerance = 0.0001;
    
    for (let i = 0; i < maxIterations; i++) {
      let npv = 0;
      let dnpv = 0;
      
      for (let t = 0; t < allFlows.length; t++) {
        npv += allFlows[t] / Math.pow(1 + rate, t);
        dnpv -= t * allFlows[t] / Math.pow(1 + rate, t + 1);
      }
      
      const newRate = rate - npv / dnpv;
      
      if (Math.abs(newRate - rate) < tolerance) {
        return newRate;
      }
      
      rate = newRate;
    }
    
    return rate;
  };
  
  const irr = useMemo(() => {
    try {
      return calculateIRR(cashFlows);
    } catch {
      return 0;
    }
  }, [initialInvestment, cashFlows]);
  
  const npvData = useMemo(() => {
    const rates = [];
    for (let r = -0.5; r <= 0.5; r += 0.01) {
      const allFlows = [initialInvestment, ...cashFlows];
      const npv = allFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + r, t), 0);
      rates.push({ rate: (r * 100).toFixed(1), npv: npv.toFixed(0) });
    }
    return rates;
  }, [initialInvestment, cashFlows]);
  
  const cashFlowData = useMemo(() => {
    return [
      { year: 0, cashFlow: initialInvestment, type: 'Initial Investment' },
      ...cashFlows.map((cf, idx) => ({
        year: idx + 1,
        cashFlow: cf,
        type: 'Cash Inflow'
      }))
    ];
  }, [initialInvestment, cashFlows]);
  
  const addCashFlow = () => {
    setCashFlows([...cashFlows, 0]);
  };
  
  const removeCashFlow = (index) => {
    setCashFlows(cashFlows.filter((_, i) => i !== index));
  };
  
  const updateCashFlow = (index, value) => {
    const newFlows = [...cashFlows];
    newFlows[index] = parseFloat(value) || 0;
    setCashFlows(newFlows);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">IRR Calculator</h1>
          </div>
          
          {/* IRR Result Card */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm mb-1">Internal Rate of Return</p>
                <p className="text-5xl font-bold">{(irr * 100).toFixed(2)}%</p>
              </div>
              <DollarSign className="w-16 h-16 opacity-50" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Initial Investment
                </label>
                <input
                  type="number"
                  value={initialInvestment}
                  onChange={(e) => setInitialInvestment(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="-100000"
                />
                <p className="text-xs text-gray-500 mt-1">Enter as negative number</p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Cash Flows by Year
                  </label>
                  <button
                    onClick={addCashFlow}
                    className="flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Year
                  </button>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {cashFlows.map((cf, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 w-16">Year {idx + 1}</span>
                      <input
                        type="number"
                        value={cf}
                        onChange={(e) => updateCashFlow(idx, e.target.value)}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="0"
                      />
                      <button
                        onClick={() => removeCashFlow(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Cash Flow Bar Chart */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Cash Flow Timeline</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Bar dataKey="cashFlow" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* NPV vs Discount Rate Chart */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">NPV vs Discount Rate</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={npvData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="rate" 
                  label={{ value: 'Discount Rate (%)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis label={{ value: 'NPV ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `$${parseFloat(value).toLocaleString()}`} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="npv" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  name="Net Present Value"
                  dot={false}
                />
                {/* IRR marker line */}
                <Line
                  type="monotone"
                  dataKey={() => 0}
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Break-even (IRR)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-2 text-center">
              IRR is where the line crosses zero (NPV = 0)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}