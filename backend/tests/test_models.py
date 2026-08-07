import math
import pytest
from models.black_scholes import black_scholes_price, black_scholes_greeks
from models.binomial_tree import binomial_tree_price
from models.monte_carlo import monte_carlo_price


def test_black_scholes_atm_call():
    """
    Standard ATM Call test case:
    S=100, K=100, T=1, r=5%, sigma=20% -> Call Price approx 10.45
    """
    res = black_scholes_price(S=100.0, K=100.0, T=1.0, r=0.05, sigma=0.20, option_type="call")
    assert "price" in res
    assert "d1" in res
    assert "d2" in res
    assert math.isclose(res["price"], 10.45058, abs_tol=1e-3)


def test_put_call_parity():
    """
    Verifies Put-Call Parity: C - P = S - K * exp(-r * T)
    """
    S, K, T, r, sigma = 100.0, 95.0, 1.5, 0.04, 0.25
    call_price = black_scholes_price(S, K, T, r, sigma, "call")["price"]
    put_price = black_scholes_price(S, K, T, r, sigma, "put")["price"]
    
    lhs = call_price - put_price
    rhs = S - K * math.exp(-r * T)
    
    assert math.isclose(lhs, rhs, abs_tol=1e-5)


def test_greeks_bounds():
    """
    Verifies standard Greek bounds for calls and puts.
    """
    S, K, T, r, sigma = 100.0, 100.0, 1.0, 0.05, 0.20
    call_greeks = black_scholes_greeks(S, K, T, r, sigma, "call")
    put_greeks = black_scholes_greeks(S, K, T, r, sigma, "put")

    # Call Delta in (0, 1), Put Delta in (-1, 0)
    assert 0.0 < call_greeks["delta"] < 1.0
    assert -1.0 < put_greeks["delta"] < 0.0
    
    # Delta relation: Call Delta - Put Delta = 1
    assert math.isclose(call_greeks["delta"] - put_greeks["delta"], 1.0, abs_tol=1e-5)

    # Gamma and Vega are positive and equal for call/put
    assert call_greeks["gamma"] > 0
    assert math.isclose(call_greeks["gamma"], put_greeks["gamma"], abs_tol=1e-5)
    assert call_greeks["vega"] > 0
    assert math.isclose(call_greeks["vega"], put_greeks["vega"], abs_tol=1e-5)


def test_binomial_tree_convergence():
    """
    Verifies that Binomial Tree price converges to Black-Scholes as N increases.
    """
    S, K, T, r, sigma = 100.0, 100.0, 1.0, 0.05, 0.20
    bs_price = black_scholes_price(S, K, T, r, sigma, "call")["price"]
    
    bt_50 = binomial_tree_price(S, K, T, r, sigma, N=50, option_type="call")["price"]
    bt_200 = binomial_tree_price(S, K, T, r, sigma, N=200, option_type="call")["price"]

    # Difference between N=200 and BS should be under 0.05
    assert abs(bt_200 - bs_price) < 0.05
    assert abs(bt_200 - bs_price) <= abs(bt_50 - bs_price) + 0.02


def test_monte_carlo_confidence_interval():
    """
    Verifies that Black-Scholes price falls within Monte Carlo 95% Confidence Interval.
    """
    S, K, T, r, sigma = 100.0, 100.0, 1.0, 0.05, 0.20
    bs_price = black_scholes_price(S, K, T, r, sigma, "call")["price"]
    
    mc_res = monte_carlo_price(S, K, T, r, sigma, num_simulations=50000, option_type="call", seed=42)
    
    assert mc_res["ci_lower"] <= bs_price <= mc_res["ci_upper"]
