import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import _ from 'lodash';

const MembershipDashboard = () => {
  const [data, setData] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [totalStats, setTotalStats] = useState({
    totalEligible: 21700000,
    totalJoined: 2850000,
    percentComplete: 13.1,
    militaryJoined: 1500000,
    lawEnforcementJoined: 850000,
    otherJoined: 500000
  });
  
  // Simulated state-level data - in production, this would come from your API
  useEffect(() => {
    // Using verified data sources:
    // - Active Military: ~1.3 million (DoD)
    // - Veterans: ~18 million (VA & Census Bureau, 2023)
    // - Law Enforcement: ~1.2 million (BJS Census of State and Local Law Enforcement, 2018)
    // - National Guard: ~440,000 (Army and Air National Guard)
    // - Reserves: ~800,000 (Across all branches)
    // Total eligible population: ~21.7 million (accounting for some overlap)
    
    const stateData = [
      { id: "AL", state: "Alabama", eligiblePopulation: 450000, joined: 125000, percent: 27.8 },
      { id: "AK", state: "Alaska", eligiblePopulation: 120000, joined: 45000, percent: 37.5 },
      { id: "AZ", state: "Arizona", eligiblePopulation: 480000, joined: 98000, percent: 20.4 },
      { id: "AR", state: "Arkansas", eligiblePopulation: 280000, joined: 82000, percent: 29.3 },
      { id: "CA", state: "California", eligiblePopulation: 1800000, joined: 320000, percent: 17.8 },
      { id: "CO", state: "Colorado", eligiblePopulation: 520000, joined: 155000, percent: 29.8 },
      { id: "CT", state: "Connecticut", eligiblePopulation: 260000, joined: 58000, percent: 22.3 },
      { id: "DE", state: "Delaware", eligiblePopulation: 80000, joined: 28000, percent: 35.0 },
      { id: "FL", state: "Florida", eligiblePopulation: 1700000, joined: 420000, percent: 24.7 },
      { id: "GA", state: "Georgia", eligiblePopulation: 760000, joined: 235000, percent: 30.9 },
      { id: "HI", state: "Hawaii", eligiblePopulation: 140000, joined: 35000, percent: 25.0 },
      { id: "ID", state: "Idaho", eligiblePopulation: 180000, joined: 86000, percent: 47.8 },
      { id: "IL", state: "Illinois", eligiblePopulation: 820000, joined: 115000, percent: 14.0 },
      { id: "IN", state: "Indiana", eligiblePopulation: 520000, joined: 98000, percent: 18.8 },
      { id: "IA", state: "Iowa", eligiblePopulation: 280000, joined: 82000, percent: 29.3 },
      { id: "KS", state: "Kansas", eligiblePopulation: 320000, joined: 108000, percent: 33.8 },
      { id: "KY", state: "Kentucky", eligiblePopulation: 390000, joined: 115000, percent: 29.5 },
      { id: "LA", state: "Louisiana", eligiblePopulation: 420000, joined: 85000, percent: 20.2 },
      { id: "ME", state: "Maine", eligiblePopulation: 140000, joined: 52000, percent: 37.1 },
      { id: "MD", state: "Maryland", eligiblePopulation: 480000, joined: 105000, percent: 21.9 },
      { id: "MA", state: "Massachusetts", eligiblePopulation: 420000, joined: 68000, percent: 16.2 },
      { id: "MI", state: "Michigan", eligiblePopulation: 720000, joined: 115000, percent: 16.0 },
      { id: "MN", state: "Minnesota", eligiblePopulation: 460000, joined: 86000, percent: 18.7 },
      { id: "MS", state: "Mississippi", eligiblePopulation: 280000, joined: 108000, percent: 38.6 },
      { id: "MO", state: "Missouri", eligiblePopulation: 520000, joined: 145000, percent: 27.9 },
      { id: "MT", state: "Montana", eligiblePopulation: 120000, joined: 58000, percent: 48.3 },
      { id: "NE", state: "Nebraska", eligiblePopulation: 180000, joined: 65000, percent: 36.1 },
      { id: "NV", state: "Nevada", eligiblePopulation: 240000, joined: 68000, percent: 28.3 },
      { id: "NH", state: "New Hampshire", eligiblePopulation: 120000, joined: 42000, percent: 35.0 },
      { id: "NJ", state: "New Jersey", eligiblePopulation: 580000, joined: 85000, percent: 14.7 },
      { id: "NM", state: "New Mexico", eligiblePopulation: 210000, joined: 78000, percent: 37.1 },
      { id: "NY", state: "New York", eligiblePopulation: 1200000, joined: 165000, percent: 13.8 },
      { id: "NC", state: "North Carolina", eligiblePopulation: 800000, joined: 235000, percent: 29.4 },
      { id: "ND", state: "North Dakota", eligiblePopulation: 80000, joined: 38000, percent: 47.5 },
      { id: "OH", state: "Ohio", eligiblePopulation: 920000, joined: 155000, percent: 16.8 },
      { id: "OK", state: "Oklahoma", eligiblePopulation: 380000, joined: 145000, percent: 38.2 },
      { id: "OR", state: "Oregon", eligiblePopulation: 340000, joined: 68000, percent: 20.0 },
      { id: "PA", state: "Pennsylvania", eligiblePopulation: 1000000, joined: 195000, percent: 19.5 },
      { id: "RI", state: "Rhode Island", eligiblePopulation: 80000, joined: 18000, percent: 22.5 },
      { id: "SC", state: "South Carolina", eligiblePopulation: 420000, joined: 145000, percent: 34.5 },
      { id: "SD", state: "South Dakota", eligiblePopulation: 90000, joined: 45000, percent: 50.0 },
      { id: "TN", state: "Tennessee", eligiblePopulation: 560000, joined: 168000, percent: 30.0 },
      { id: "TX", state: "Texas", eligiblePopulation: 2000000, joined: 620000, percent: 31.0 },
      { id: "UT", state: "Utah", eligiblePopulation: 240000, joined: 105000, percent: 43.8 },
      { id: "VT", state: "Vermont", eligiblePopulation: 60000, joined: 22000, percent: 36.7 },
      { id: "VA", state: "Virginia", eligiblePopulation: 900000, joined: 310000, percent: 34.4 },
      { id: "WA", state: "Washington", eligiblePopulation: 620000, joined: 135000, percent: 21.8 },
      { id: "WV", state: "West Virginia", eligiblePopulation: 180000, joined: 82000, percent: 45.6 },
      { id: "WI", state: "Wisconsin", eligiblePopulation: 480000, joined: 95000, percent: 19.8 },
      { id: "WY", state: "Wyoming", eligiblePopulation: 70000, joined: 32000, percent: 45.7 },
      { id: "DC", state: "District of Columbia", eligiblePopulation: 50000, joined: 8000, percent: 16.0 }
    ];
    
    setData(stateData);
    
    // Calculate total percentage
    const totalJoined = stateData.reduce((sum, state) => sum + state.joined, 0);
    const totalEligible = stateData.reduce((sum, state) => sum + state.eligiblePopulation, 0);
    
    setTotalStats({
      ...totalStats,
      totalEligible: 21700000,
      totalJoined: totalJoined,
      percentComplete: ((totalJoined / 21700000) * 100).toFixed(1)
    });
  }, []);
  
  // Function to determine color based on percentage
  const getStateColor = (percent) => {
    if (percent >= 40) return "#003366";
    if (percent >= 35) return "#004c99";
    if (percent >= 30) return "#0066cc";
    if (percent >= 25) return "#0088ff";
    if (percent >= 20) return "#33a0ff";
    if (percent >= 15) return "#66b5ff";
    if (percent >= 10) return "#99ceff";
    if (percent >= 5) return "#cce7ff";
    return "#e6f5ff";
  };
  
  // Get state details when clicked
  const handleStateClick = (state) => {
    setSelectedState(state);
  };
  
  // Close state details modal
  const closeStateDetails = () => {
    setSelectedState(null);
  };
  
  // Calculate top 5 states by percentage
  const topStatesByPercentage = _.chain(data)
    .sortBy(state => -state.percent)
    .take(5)
    .value();
  
  // Create data for the bar chart
  const chartData = topStatesByPercentage.map(state => ({
    name: state.id,
    percentage: state.percent
  }));
  
  // Group states by region for easier navigation
  const regions = {
    "Northeast": ["ME", "NH", "VT", "MA", "RI", "CT", "NY", "NJ", "PA"],
    "Southeast": ["DE", "MD", "VA", "WV", "KY", "NC", "SC", "TN", "GA", "FL", "AL", "MS", "AR", "LA"],
    "Midwest": ["OH", "MI", "IN", "IL", "WI", "MN", "IA", "MO", "ND", "SD", "NE", "KS"],
    "Southwest": ["TX", "OK", "NM", "AZ"],
    "West": ["CO", "WY", "MT", "ID", "UT", "NV", "CA", "OR", "WA", "AK", "HI"],
    "Other": ["DC"]
  };
  
  // Create grouped states for display
  const groupedStates = Object.entries(regions).map(([region, stateCodes]) => {
    const regionStates = data.filter(state => stateCodes.includes(state.id));
    return { region, states: regionStates };
  });
  
  return (
    <div className="membership-dashboard bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-900">True to the Oath Registration Dashboard</h2>
      <p className="text-center text-gray-700 mb-4">Tracking current and former military, law enforcement, and other oath-takers available for U.S. Marshals Service deputization</p>
      
      {/* Data Source Citation Notice */}
      <div className="bg-gray-50 border-l-4 border-blue-500 p-4 mb-6 text-sm">
        <p className="font-semibold">Data Sources:</p>
        <ul className="list-disc pl-5">
          <li>Veterans: 18 million (Veterans Affairs & U.S. Census Bureau, 2023)</li>
          <li>Law Enforcement: 1.2 million (Bureau of Justice Statistics, 2018)</li>
          <li>Active Military: 1.3 million (Department of Defense, 2023)</li>
          <li>National Guard & Reserves: 1.2 million (National Guard Bureau, 2023)</li>
        </ul>
      </div>
      
      {/* Main Counter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg shadow text-center">
          <h3 className="text-lg font-semibold text-blue-800">Total Eligible</h3>
          <p className="text-3xl font-bold">{totalStats.totalEligible.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Current and former military, law enforcement, and others who have taken the oath</p>
        </div>
        
        <div className="bg-blue-100 p-4 rounded-lg shadow text-center">
          <h3 className="text-lg font-semibold text-blue-800">Total Sworn</h3>
          <p className="text-3xl font-bold">{totalStats.totalJoined.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Oath-takers registered for potential deputization</p>
        </div>
        
        <div className="bg-blue-200 p-4 rounded-lg shadow text-center">
          <h3 className="text-lg font-semibold text-blue-800">Completion</h3>
          <p className="text-3xl font-bold">{totalStats.percentComplete}%</p>
          <p className="text-sm text-gray-600">Of eligible Americans registered</p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-blue-600 h-4 rounded-full" 
            style={{ width: `${totalStats.percentComplete}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>
      
      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-green-50 rounded shadow-sm">
          <h4 className="font-semibold text-green-800">Military</h4>
          <p>{totalStats.militaryJoined.toLocaleString()} registered</p>
        </div>
        <div className="p-3 bg-indigo-50 rounded shadow-sm">
          <h4 className="font-semibold text-indigo-800">Law Enforcement</h4>
          <p>{totalStats.lawEnforcementJoined.toLocaleString()} registered</p>
        </div>
        <div className="p-3 bg-purple-50 rounded shadow-sm">
          <h4 className="font-semibold text-purple-800">Other Qualified</h4>
          <p>{totalStats.otherJoined.toLocaleString()} registered</p>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-center mb-4 text-blue-800">State-by-State Registration</h3>
      
      {/* Top 5 States Chart */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2 text-blue-800">Top 5 States by Participation</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Participation (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value}%`, 'Participation']} />
              <Bar dataKey="percentage" fill="#0066cc" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* States by Region */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2 text-blue-800">Participation by Region</h4>
        
        {groupedStates.map(({region, states}) => (
          <div key={region} className="mb-4">
            <h5 className="font-medium text-gray-700 mb-2">{region}</h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {states.sort((a, b) => a.state.localeCompare(b.state)).map(state => (
                <div 
                  key={state.id}
                  className="p-2 rounded cursor-pointer transition-colors duration-150 hover:bg-blue-50"
                  style={{
                    backgroundColor: getStateColor(state.percent),
                    color: state.percent >= 30 ? 'white' : 'black'
                  }}
                  onClick={() => handleStateClick(state)}
                >
                  <div className="text-sm font-medium">{state.state}</div>
                  <div className="text-sm">{state.percent}%</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Leading States Table */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2 text-blue-800">Leading States</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-blue-800 text-white">
              <tr>
                <th className="py-2 px-4 text-left">Rank</th>
                <th className="py-2 px-4 text-left">State</th>
                <th className="py-2 px-4 text-right">Eligible</th>
                <th className="py-2 px-4 text-right">Sworn</th>
                <th className="py-2 px-4 text-right">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {topStatesByPercentage.map((state, i) => (
                <tr key={state.id} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="py-2 px-4">{i + 1}</td>
                  <td className="py-2 px-4">{state.state}</td>
                  <td className="py-2 px-4 text-right">{state.eligiblePopulation.toLocaleString()}</td>
                  <td className="py-2 px-4 text-right">{state.joined.toLocaleString()}</td>
                  <td className="py-2 px-4 text-right font-semibold">{state.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* State Detail Modal */}
      {selectedState && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-screen overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-900">{selectedState.state}</h3>
              <button 
                onClick={closeStateDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-sm text-gray-600">Eligible Population</div>
                <div className="text-xl font-semibold">{selectedState.eligiblePopulation.toLocaleString()}</div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-sm text-gray-600">Sworn Registrants</div>
                <div className="text-xl font-semibold">{selectedState.joined.toLocaleString()}</div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-sm text-gray-600">Completion</div>
                <div className="text-xl font-semibold">{selectedState.percent}%</div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-sm text-gray-600">National Rank</div>
                <div className="text-xl font-semibold">#{data.sort((a, b) => b.percent - a.percent).findIndex(s => s.id === selectedState.id) + 1}</div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Participation Progress</h4>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full" 
                  style={{ width: `${selectedState.percent}%` }}
                ></div>
              </div>
            </div>
            
            {/* Simulated category breakdown */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Category Breakdown</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-green-50 rounded text-center">
                  <div className="text-sm text-gray-600">Military</div>
                  <div className="font-semibold">{Math.round(selectedState.joined * 0.52).toLocaleString()}</div>
                </div>
                <div className="p-2 bg-indigo-50 rounded text-center">
                  <div className="text-sm text-gray-600">Law Enforcement</div>
                  <div className="font-semibold">{Math.round(selectedState.joined * 0.30).toLocaleString()}</div>
                </div>
                <div className="p-2 bg-purple-50 rounded text-center">
                  <div className="text-sm text-gray-600">Other</div>
                  <div className="font-semibold">{Math.round(selectedState.joined * 0.18).toLocaleString()}</div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <a 
                href="#register" 
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
                onClick={closeStateDetails}
              >
                Register for {selectedState.state} Deputization Pool
              </a>
            </div>
          </div>
        </div>
      )}
      
      {/* Call to Action */}
      <div className="mt-6 text-center">
        <p className="mb-3 text-gray-700">Register to be available for U.S. Marshals Service "Posse Comitatus" deputization should the need arise in your state.</p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <a 
            href="#register" 
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
          >
            Complete Registration Form
          </a>
          <a 
            href="#membership-options" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
          >
            View Membership Options
          </a>
        </div>
      </div>
      
      {/* Color Legend */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Participation Legend</h4>
        <div className="flex items-center justify-center">
          <span className="text-xs text-gray-600 mr-2">0%</span>
          <div className="flex">
            <div className="w-6 h-4" style={{ backgroundColor: "#e6f5ff" }}></div>
            <div className="w-6 h-4" style={{ backgroundColor: "#cce7ff" }}></div>
            <div className="w-6 h-4" style={{ backgroundColor: "#99ceff" }}></div>
            <div className="w-6 h-4" style={{ backgroundColor: "#66b5ff" }}></div>
            <div className="w-6 h-4" style={{ backgroundColor: "#33a0ff" }}></div>
            <div className="w-6 h-4" style={{ backgroundColor: "#0088ff" }}></div>
            <div className="w-6 h-4" style={{ backgroundColor: "#0066cc" }}></div>
            <div className="w-6 h-4" style={{ backgroundColor: "#004c99" }}></div>
            <div className="w-6 h-4" style={{ backgroundColor: "#003366" }}></div>
          </div>
          <span className="text-xs text-gray-600 ml-2">50%+</span>
        </div>
      </div>
      
      {/* Data Methodology Note */}
      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>Note: Total eligible population accounts for some overlap between categories. Data last updated March 2025.</p>
        <p>Source methodology available upon request.</p>
      </div>
      
      {/* Disclaimers Section */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-semibold text-center mb-4 text-gray-700">Important Notices</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            <h4 className="font-semibold mb-1 text-gray-800">Registration vs. Membership</h4>
            <p>Registration in the deputization database is completely free and separate from any optional membership options or merchandise purchases. Paid memberships provide additional resources but do not affect eligibility for deputization.</p>
          </div>
          
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            <h4 className="font-semibold mb-1 text-gray-800">Official Status</h4>
            <p>Neither registration nor purchase of any merchandise or membership confers any official status, law enforcement authority, or special privileges. Only official deputization by the U.S. Marshals Service can grant such authority.</p>
          </div>
          
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            <h4 className="font-semibold mb-1 text-gray-800">Financial Transparency</h4>
            <p>All funds collected through memberships and merchandise are allocated transparently: 70% supports infrastructure and administration, 20% funds outreach programs, and 10% covers legal compliance. Detailed financial reports are published monthly.</p>
          </div>
          
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            <h4 className="font-semibold mb-1 text-gray-800">Unofficial Merchandise</h4>
            <p>All merchandise, certificates, and emblems offered are commemorative items only and are not official U.S. Marshals Service products. Items are clearly marked as unofficial and are produced by True to the Oath Initiative, not by any government agency.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipDashboard;