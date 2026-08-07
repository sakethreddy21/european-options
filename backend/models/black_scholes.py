"""
===============================================================================
BLACK-SCHOLES-MERTON MODEL FOR EUROPEAN OPTIONS
===============================================================================
Mathematical Foundation & Assumptions:
--------------------------------------
1. The underlying asset price S(t) follows a Geometric Brownian Motion (GBM):
       dS_t = r * S_t * dt + sigma * S_t * dW_t
   where:
       r     = Risk-free interest rate (annualized, continuously compounded)
       sigma = Volatility of the asset returns (annualized)
       dW_t  = Standard Wiener process (Brownian motion)

2. No arbitrage opportunities exist in the market.
3. European options can only be exercised at maturity T.
4. No transaction costs or taxes exist, and short selling is permitted.
5. The risk-free rate r and volatility sigma are constant over the option life.

Black-Scholes Partial Differential Equation (PDE):
--------------------------------------------------
   ∂V/∂t + (1/2) * sigma^2 * S^2 * (∂^2 V / ∂S^2) + r * S * (∂V/∂S) - r * V = 0

Solving this PDE subject to European Call/Put boundary conditions yields the
closed-form pricing formulas.
===============================================================================
"""

import math
from typing import Dict
from scipy.stats import norm


def calculate_d1(S: float, K: float, T: float, r: float, sigma: float) -> float:
    """
    Step 1: Calculate d1 parameter.
    --------------------------------
    d1 measures the standardized distance from current spot price S to strike price K,
    adjusted for risk-free growth rate (r + 0.5 * sigma^2) over time T.

    Formula:
        d1 = [ ln(S / K) + (r + 0.5 * sigma^2) * T ] / [ sigma * sqrt(T) ]

    Parameters:
        S     : Current spot price of the underlying asset (S_0 > 0)
        K     : Strike (exercise) price (K > 0)
        T     : Time to expiration in years (T > 0)
        r     : Continuously compounded risk-free interest rate
        sigma : Annualized volatility (sigma > 0)
    """
    # Numerator: Log returns + drift term scaled by time
    numerator = math.log(S / K) + (r + 0.5 * (sigma ** 2)) * T
    # Denominator: Total accumulated standard deviation over time horizon T
    denominator = sigma * math.sqrt(T)
    
    return numerator / denominator


def calculate_d2(d1: float, sigma: float, T: float) -> float:
    """
    Step 2: Calculate d2 parameter.
    --------------------------------
    d2 represents d1 adjusted for volatility over time T.
    In probability theory, N(d2) represents the risk-neutral probability that the
    option will expire in-the-money (S_T > K for Call).

    Formula:
        d2 = d1 - sigma * sqrt(T)
    """
    return d1 - sigma * math.sqrt(T)


def black_scholes_price(
    S: float, K: float, T: float, r: float, sigma: float, option_type: str = "call"
) -> Dict[str, float]:
    """
    Step 3: Calculate Black-Scholes European Option Price.
    ------------------------------------------------------
    Closed-Form Call Formula:
        C = S * N(d1) - K * exp(-r * T) * N(d2)

    Closed-Form Put Formula (via Put-Call Parity):
        P = K * exp(-r * T) * N(-d2) - S * N(-d1)

    where N(x) is the cumulative distribution function (CDF) of standard normal distribution.

    Interpretation of Terms:
        - S * N(d1)           : Present value of expected asset receipt if option exercised
        - K * exp(-r*T) * N(d2): Present value of expected cash strike payment
    """
    option_type = option_type.lower()
    if option_type not in ["call", "put"]:
        raise ValueError("option_type must be either 'call' or 'put'")

    # Edge cases: immediate expiry or zero volatility
    if T <= 0:
        if option_type == "call":
            price = max(0.0, S - K)
        else:
            price = max(0.0, K - S)
        return {"price": price, "d1": 0.0, "d2": 0.0}

    # Step A: Compute d1 and d2
    d1 = calculate_d1(S, K, T, r, sigma)
    d2 = calculate_d2(d1, sigma, T)

    # Step B: Discount factor for cash strike price
    discount_factor = math.exp(-r * T)

    # Step C: Apply formula according to option type
    if option_type == "call":
        # Call price = Spot * N(d1) - PV(Strike) * N(d2)
        price = S * norm.cdf(d1) - K * discount_factor * norm.cdf(d2)
    else:
        # Put price = PV(Strike) * N(-d2) - Spot * N(-d1)
        price = K * discount_factor * norm.cdf(-d2) - S * norm.cdf(-d1)

    return {
        "price": float(price),
        "d1": d1,
        "d2": d2
    }


def black_scholes_greeks(
    S: float, K: float, T: float, r: float, sigma: float, option_type: str = "call"
) -> Dict[str, float]:
    """
    Step 4: Calculate Analytical Option Greeks.
    ------------------------------------------
    Greeks measure the sensitivity of the option price to changes in underlying parameters.

    1. Delta (∂V/∂S):
       - Rate of change of option price with respect to spot price S.
       - Call Delta = N(d1)                     [Range: 0 to 1]
       - Put Delta  = N(d1) - 1                 [Range: -1 to 0]

    2. Gamma (∂²V/∂S²):
       - Rate of change of Delta with respect to spot price S.
       - Same for both Call and Put:
         Gamma = N'(d1) / (S * sigma * sqrt(T))

    3. Vega (∂V/∂sigma):
       - Sensitivity of option price to a 1 percentage point (0.01) change in volatility sigma.
       - Same for both Call and Put:
         Vega = S * N'(d1) * sqrt(T)

    4. Theta (∂V/∂T):
       - Time decay: Sensitivity of option price to time passage (usually expressed per day).
       - Call Theta = - [S * N'(d1) * sigma / (2 * sqrt(T))] - r * K * exp(-r*T) * N(d2)
       - Put Theta  = - [S * N'(d1) * sigma / (2 * sqrt(T))] + r * K * exp(-r*T) * N(-d2)

    5. Rho (∂V/∂r):
       - Sensitivity of option price to interest rate changes (per 1% change in r).
       - Call Rho = K * T * exp(-r*T) * N(d2)
       - Put Rho  = -K * T * exp(-r*T) * N(-d2)
    """
    option_type = option_type.lower()
    
    if T <= 0 or sigma <= 0:
        return {"delta": 0.0, "gamma": 0.0, "vega": 0.0, "theta": 0.0, "rho": 0.0}

    d1 = calculate_d1(S, K, T, r, sigma)
    d2 = calculate_d2(d1, sigma, T)

    # Standard normal probability density function (PDF) evaluated at d1: N'(d1)
    pdf_d1 = norm.pdf(d1)
    discount_factor = math.exp(-r * T)
    sqrt_T = math.sqrt(T)

    # Delta
    if option_type == "call":
        delta = norm.cdf(d1)
    else:
        delta = norm.cdf(d1) - 1.0

    # Gamma (identical for Call and Put)
    gamma = pdf_d1 / (S * sigma * sqrt_T)

    # Vega (identical for Call and Put; scaling by 0.01 for 1% change in volatility)
    vega = S * pdf_d1 * sqrt_T

    # Theta (Time decay per year)
    term1 = -(S * pdf_d1 * sigma) / (2 * sqrt_T)
    if option_type == "call":
        theta_annual = term1 - r * K * discount_factor * norm.cdf(d2)
    else:
        theta_annual = term1 + r * K * discount_factor * norm.cdf(-d2)
    
    # Theta expressed per calendar day (1 / 365)
    theta_daily = theta_annual / 365.0

    # Rho (per 1% interest rate move)
    if option_type == "call":
        rho = K * T * discount_factor * norm.cdf(d2)
    else:
        rho = -K * T * discount_factor * norm.cdf(-d2)

    return {
        "delta": float(delta),
        "gamma": float(gamma),
        "vega": float(vega / 100.0),      # Standard convention: price change per +1% vol
        "theta": float(theta_daily),        # Daily time decay
        "theta_annual": float(theta_annual),
        "rho": float(rho / 100.0)          # Price change per +1% interest rate
    }
