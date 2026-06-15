import React, { useState, useEffect } from 'react';

export default function WeatherRates() {
  const [rates, setRates] = useState([]);

  useEffect(() => {
    fetch('/api/get_configs.php?key=top_header_rates')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.value) {
          setRates(data.value);
        }
      })
      .catch(err => console.error("Error fetching rates:", err));
  }, []);

  return (
    <div className="rates-widget-bar hide-mobile">
      <div className="container">
        <div className="rates-container">
          <div className="rates-group">
            {rates.map((rate, idx) => (
              <div key={idx} className="rates-item">
                <span className="rates-label">{rate.label}:</span>
                <span className="rates-value semibold">{rate.val}</span>
                {rate.change && (
                  <span className={`rates-change ${rate.trend === 'up' ? 'up' : rate.trend === 'down' ? 'down' : ''} bold`}>
                    {rate.change}
                  </span>
                )}
                {rate.extra && (
                  <span className="text-muted italic">({rate.extra})</span>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
