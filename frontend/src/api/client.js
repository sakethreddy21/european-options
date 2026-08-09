/**
 * API Client for European Options Simulation Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function fetchPriceComparison(params) {
  const response = await fetch(`${API_BASE_URL}/price`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to fetch price comparison');
  }
  return await response.json();
}

export async function fetchBinomialTree(params) {
  const response = await fetch(`${API_BASE_URL}/binomial-tree`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      S: params.S,
      K: params.K,
      T: params.T,
      r: params.r,
      sigma: params.sigma,
      option_type: params.option_type,
      N: params.binomial_steps_vis || 5
    })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to fetch binomial tree structure');
  }
  return await response.json();
}

export async function fetchMonteCarloPaths(params) {
  const response = await fetch(`${API_BASE_URL}/monte-carlo-paths`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      S: params.S,
      K: params.K,
      T: params.T,
      r: params.r,
      sigma: params.sigma,
      option_type: params.option_type,
      num_paths: 40,
      time_steps: 40
    })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to fetch Monte Carlo paths');
  }
  return await response.json();
}

export async function fetchConvergence(params) {
  const response = await fetch(`${API_BASE_URL}/convergence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to fetch convergence data');
  }
  return await response.json();
}

export async function fetchSensitivity(params) {
  const response = await fetch(`${API_BASE_URL}/sensitivity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      S: params.S,
      K: params.K,
      T: params.T,
      r: params.r,
      sigma: params.sigma,
      option_type: params.option_type
    })
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to fetch sensitivity analysis');
  }
  return await response.json();
}
