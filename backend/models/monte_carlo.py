"""
===============================================================================
MONTE CARLO SIMULATION MODEL FOR EUROPEAN OPTIONS
===============================================================================
Mathematical Foundation & Methodology:
--------------------------------------
Under the risk-neutral measure Q, the asset price S(t) obeys the SDE:
    dS_t = r * S_t * dt + sigma * S_t * dW_t

Applying Ito's Lemma to ln(S_t):
    d(ln S_t) = (r - 0.5 * sigma^2) * dt + sigma * dW_t

Integrating from 0 to T yields the exact closed-form solution for terminal price S_T:
    S_T = S_0 * exp( (r - 0.5 * sigma^2) * T + sigma * sqrt(T) * Z )
where Z ~ Standard Normal N(0, 1).

Monte Carlo Estimator & Law of Large Numbers:
---------------------------------------------
1. Generate M independent random samples Z_1, Z_2, ..., Z_M ~ N(0, 1).
2. Compute M terminal stock prices S_{T, i}.
3. Compute M option payoffs:
       Payoff_i = max(0, S_{T, i} - K)       [Call]
       Payoff_i = max(0, K - S_{T, i})       [Put]
4. Compute Discounted Sample Mean (Option Price Estimator):
       V_MC = exp(-r * T) * (1 / M) * sum_{i=1}^M Payoff_i

5. Statistical Error Analysis (Central Limit Theorem):
       Sample Variance s^2 = (1 / (M - 1)) * sum_{i=1}^M (Payoff_i - Mean_Payoff)^2
       Standard Error SE   = exp(-r * T) * s / sqrt(M)
       95% Confidence Interval = [ V_MC - 1.96 * SE, V_MC + 1.96 * SE ]
===============================================================================
"""

import math
from typing import Dict, List, Any, Optional
import numpy as np


def monte_carlo_price(
    S: float,
    K: float,
    T: float,
    r: float,
    sigma: float,
    num_simulations: int = 50000,
    option_type: str = "call",
    seed: Optional[int] = None
) -> Dict[str, Any]:
    """
    Vectorized Monte Carlo simulation for European Option pricing.
    Includes mean price, standard error, and 95% confidence intervals.
    """
    option_type = option_type.lower()
    if option_type not in ["call", "put"]:
        raise ValueError("option_type must be either 'call' or 'put'")

    if seed is not None:
        np.random.seed(seed)

    # Step 1: Generate M standard normal random variates Z ~ N(0, 1)
    Z = np.random.standard_normal(num_simulations)

    # Step 2: Compute terminal stock prices S_T under Geometric Brownian Motion
    drift = (r - 0.5 * (sigma ** 2)) * T
    diffusion = sigma * math.sqrt(T) * Z
    S_T = S * np.exp(drift + diffusion)

    # Step 3: Compute option payoffs at maturity T
    if option_type == "call":
        payoffs = np.maximum(0.0, S_T - K)
    else:
        payoffs = np.maximum(0.0, K - S_T)

    # Step 4: Discount factor e^(-r * T)
    discount_factor = math.exp(-r * T)
    discounted_payoffs = discount_factor * payoffs

    # Step 5: Calculate Monte Carlo point estimate (sample mean)
    price_estimate = float(np.mean(discounted_payoffs))

    # Step 6: Compute Sample Standard Deviation & Standard Error (SE)
    sample_std = float(np.std(discounted_payoffs, ddof=1))
    standard_error = sample_std / math.sqrt(num_simulations)

    # Step 7: 95% Confidence Interval bounds (Z_{0.025} ≈ 1.96)
    ci_lower = price_estimate - 1.96 * standard_error
    ci_upper = price_estimate + 1.96 * standard_error

    return {
        "price": price_estimate,
        "standard_error": standard_error,
        "ci_lower": ci_lower,
        "ci_upper": ci_upper,
        "num_simulations": num_simulations,
        "sample_std": sample_std
    }


def generate_monte_carlo_paths(
    S: float,
    K: float,
    T: float,
    r: float,
    sigma: float,
    num_paths: int = 50,
    time_steps: int = 50,
    option_type: str = "call",
    seed: int = 42
) -> Dict[str, Any]:
    """
    Generates time-series simulation paths for multi-step asset price trajectories.
    Used for visualization in line graphs on the frontend.
    """
    if seed is not None:
        np.random.seed(seed)

    dt = T / time_steps
    time_grid = [round(t * dt, 4) for t in range(time_steps + 1)]

    # Matrix of shape (num_paths, time_steps + 1)
    paths = np.zeros((num_paths, time_steps + 1))
    paths[:, 0] = S

    # Simulating Brownian Motion step-by-step
    drift = (r - 0.5 * (sigma ** 2)) * dt
    diffusion_std = sigma * math.sqrt(dt)

    for t in range(1, time_steps + 1):
        Z = np.random.standard_normal(num_paths)
        paths[:, t] = paths[:, t - 1] * np.exp(drift + diffusion_std * Z)

    # Compute terminal payoffs for these paths
    terminal_prices = paths[:, -1]
    if option_type.lower() == "call":
        payoffs = np.maximum(0.0, terminal_prices - K)
    else:
        payoffs = np.maximum(0.0, K - terminal_prices)

    # Convert paths to list format for JSON serialization
    formatted_paths = []
    for i in range(min(num_paths, 100)):
        formatted_paths.append({
            "path_id": i + 1,
            "prices": [round(float(p), 4) for p in paths[i, :]],
            "terminal_price": round(float(terminal_prices[i]), 4),
            "payoff": round(float(payoffs[i]), 4)
        })

    # Payoff distribution histogram bins (20 bins)
    hist, bin_edges = np.histogram(terminal_prices, bins=20)
    histogram_data = []
    for i in range(len(hist)):
        histogram_data.append({
            "bin_start": round(float(bin_edges[i]), 2),
            "bin_end": round(float(bin_edges[i + 1]), 2),
            "count": int(hist[i])
        })

    return {
        "time_grid": time_grid,
        "paths": formatted_paths,
        "histogram": histogram_data,
        "strike": K
    }
