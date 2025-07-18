'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function ApiTester() {
  const [apiId, setApiId] = useState('ab3202cb-d0af-41af-88ce-7e51f5f6b6d3');
  const [apiToken, setApiToken] = useState('hiqelc-b-o');
  const [serviceInfo, setServiceInfo] = useState(null);
  const [inputs, setInputs] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [error, setError] = useState(null);

  // Load service info when API ID changes
  useEffect(() => {
    if (apiId) {
      loadServiceInfo();
    }
  }, [apiId]);

  const loadServiceInfo = async () => {
    setLoadingInfo(true);
    setError(null);
    try {
      const url = `/api/service-info?api=${apiId}${apiToken ? `&token=${apiToken}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load service info');
      }
      
      setServiceInfo(data);
      
      // Initialize inputs with defaults
      const defaultInputs = {};
      data.inputs.forEach(input => {
        if (input.default !== undefined) {
          defaultInputs[input.name] = input.default;
        }
      });
      setInputs(defaultInputs);
    } catch (err) {
      setError(err.message);
      setServiceInfo(null);
    } finally {
      setLoadingInfo(false);
    }
  };

  const runCalculation = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    const startTime = Date.now();
    
    try {
      // Build query string
      const params = new URLSearchParams();
      params.append('api', apiId);
      if (apiToken) params.append('token', apiToken);
      
      // Add input values
      Object.entries(inputs).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key.toLowerCase(), value);
        }
      });
      
      const response = await fetch(`/api/getresults?${params.toString()}`);
      const data = await response.json();
      
      const endTime = Date.now();
      
      if (!response.ok) {
        throw new Error(data.error || 'Calculation failed');
      }
      
      setResults({
        ...data,
        totalTime: endTime - startTime
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderInput = (input) => {
    const value = inputs[input.name] || '';
    
    return (
      <div key={input.name} className={styles.inputGroup}>
        <label className={styles.label}>
          {input.alias || input.name}
          {input.mandatory && <span className={styles.required}>*</span>}
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => handleInputChange(input.name, e.target.value)}
          placeholder={input.description || `Enter ${input.alias || input.name}`}
          className={styles.input}
        />
        <div className={styles.inputMeta}>
          {input.min !== undefined && <span>Min: {input.min}</span>}
          {input.max !== undefined && <span>Max: {input.max}</span>}
          {input.type && <span>Type: {input.type}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>API Service Tester</h1>
      
      <div className={styles.section}>
        <h2>API Configuration</h2>
        <div className={styles.configGroup}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>API ID</label>
            <input
              type="text"
              value={apiId}
              onChange={(e) => setApiId(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>API Token (optional)</label>
            <input
              type="text"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              className={styles.input}
            />
          </div>
          <button 
            onClick={loadServiceInfo} 
            disabled={loadingInfo || !apiId}
            className={styles.button}
          >
            {loadingInfo ? 'Loading...' : 'Load Service Info'}
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          Error: {error}
        </div>
      )}

      {serviceInfo && (
        <>
          <div className={styles.section}>
            <h2>{serviceInfo.name}</h2>
            {serviceInfo.description && <p>{serviceInfo.description}</p>}
            
            <h3>Input Parameters</h3>
            <div className={styles.inputs}>
              {serviceInfo.inputs.map(input => renderInput(input))}
            </div>
            
            <button 
              onClick={runCalculation} 
              disabled={loading}
              className={`${styles.button} ${styles.calculateButton}`}
            >
              {loading ? 'Calculating...' : 'Calculate'}
            </button>
          </div>

          {results && (
            <div className={styles.section}>
              <h2>Results</h2>
              
              <div className={styles.performance}>
                <h3>Performance Statistics</h3>
                <div className={styles.stats}>
                  <div>Total Time: <strong>{results.totalTime}ms</strong></div>
                  <div>API Data: <strong>{results.info?.timeApiData}ms</strong></div>
                  <div>Calculation: <strong>{results.info?.timeCalculation}ms</strong></div>
                  <div>Process Cache: <strong>{results.info?.fromProcessCache ? 'Hit' : 'Miss'}</strong></div>
                  <div>Memory Used: <strong>{results.info?.memoryUsed}</strong></div>
                </div>
              </div>

              <div className={styles.outputs}>
                <h3>Output Values</h3>
                {results.outputs?.map((output, index) => (
                  <div key={index} className={styles.outputItem}>
                    <strong>{output.alias || output.name}:</strong>
                    <span className={styles.value}>
                      {typeof output.value === 'object' 
                        ? JSON.stringify(output.value, null, 2)
                        : output.value
                      }
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.raw}>
                <h3>Raw Response</h3>
                <pre>{JSON.stringify(results, null, 2)}</pre>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}