"""
===============================================================================
COX-ROSS-RUBINSTEIN (CRR) BINOMIAL TREE MODEL FOR EUROPEAN OPTIONS
===============================================================================
Mathematical Foundation & Methodology:
--------------------------------------
The Binomial Model discretizes continuous time T into N discrete steps of size:
    dt = T / N

At each time step, the asset price S can either:
  1. Move UP by factor u: S_up = S * u
  2. Move DOWN by factor d: S_down = S * d

1. Parameter Calibration (CRR Model):
------------------------------------
To match the mean and variance of Geometric Brownian Motion as dt -> 0:
    u = exp(sigma * sqrt(dt))
    d = exp(-sigma * sqrt(dt)) = 1 / u

2. Risk-Neutral Probability (p):
--------------------------------
The risk-neutral probability of an UP movement enforces that expected asset return
equals the risk-free rate r:
    E[S_{t+dt}] = S_t * exp(r * dt) = p * (S_t * u) + (1 - p) * (S_t * d)
    => p = (exp(r * dt) - d) / (u - d)

3. Dynamic Programming Algorithm:
---------------------------------
Phase I: Forward Pass - Build Stock Price Tree Lattice
  At step i (0 <= i <= N) and node j (0 <= j <= i):
      S_{i, j} = S_0 * (u^j) * (d^(i - j))   [j represents number of UP steps]

Phase II: Boundary Condition at Expiration (i = N)
  Call Option Payoff: V_{N, j} = max(0, S_{N, j} - K)
  Put Option Payoff : V_{N, j} = max(0, K - S_{N, j})

Phase III: Backward Induction (i = N-1 down to 0)
  Risk-neutral expectation discounted at risk-free rate r:
      V_{i, j} = exp(-r * dt) * [ p * V_{i+1, j+1} + (1 - p) * V_{i+1, j} ]

Phase IV: Node-Level Hedge Ratio (Delta)
  Delta_{i, j} = (V_{i+1, j+1} - V_{i+1, j}) / (S_{i+1, j+1} - S_{i+1, j})
===============================================================================
"""

import math
from typing import Dict, List, Any


def binomial_tree_price(
    S: float,
    K: float,
    T: float,
    r: float,
    sigma: float,
    N: int = 50,
    option_type: str = "call"
) -> Dict[str, Any]:
    """
    Step-by-step Binomial Tree pricing calculation.
    """
    option_type = option_type.lower()
    if option_type not in ["call", "put"]:
        raise ValueError("option_type must be either 'call' or 'put'")

    if N <= 0:
        raise ValueError("Number of binomial steps N must be >= 1")

    # Step 1: Calculate discrete time step size dt
    dt = T / N

    # Step 2: Calculate CRR growth factors u, d, and risk-free growth factor a
    u = math.exp(sigma * math.sqrt(dt))
    d = 1.0 / u
    a = math.exp(r * dt)

    # Step 3: Calculate risk-neutral probability p
    p = (a - d) / (u - d)
    one_minus_p = 1.0 - p

    # Discount factor for a single step dt: e^(-r * dt)
    discount = math.exp(-r * dt)

    # Step 4: Construct Stock Price Lattice at Expiration (Step N)
    # Array stock_prices[j] holds asset price at maturity with j up-moves
    stock_prices_at_maturity = [S * (u ** j) * (d ** (N - j)) for j in range(N + 1)]

    # Step 5: Evaluate Option Payoff at Maturity (Step N)
    if option_type == "call":
        option_values = [max(0.0, price - K) for price in stock_prices_at_maturity]
    else:
        option_values = [max(0.0, K - price) for price in stock_prices_at_maturity]

    # Store full tree node structure if N is reasonable (e.g. N <= 30) for UI display
    tree_nodes = []

    # Step 6: Backward Induction from Step N-1 down to Step 0
    # Create an in-memory representation of backward induction
    current_option_values = list(option_values)
    
    # We maintain delta at root node (step 0)
    root_delta = 0.0

    for i in range(N - 1, -1, -1):
        next_option_values = []
        for j in range(i + 1):
            # Risk-neutral expectation: discount * [ p * V_up + (1-p) * V_down ]
            v_up = current_option_values[j + 1]
            v_down = current_option_values[j]
            v_node = discount * (p * v_up + one_minus_p * v_down)
            next_option_values.append(v_node)

            # At step 0, calculate the option delta: (V_up - V_down) / (S_up - S_down)
            if i == 0 and j == 0:
                s_up = S * u
                s_down = S * d
                root_delta = (v_up - v_down) / (s_up - s_down)

        current_option_values = next_option_values

    # Final Option Price at Root (Step 0, Node 0)
    final_price = current_option_values[0]

    return {
        "price": final_price,
        "delta": root_delta,
        "u": u,
        "d": d,
        "p": p,
        "dt": dt,
        "steps": N
    }


def generate_binomial_tree_structure(
    S: float,
    K: float,
    T: float,
    r: float,
    sigma: float,
    N: int = 5,
    option_type: str = "call"
) -> Dict[str, Any]:
    """
    Generates full explicit lattice node structure suitable for frontend visual rendering.
    Limits max N to 10 for clean graphical visualization.
    """
    N = min(N, 10)  # cap at 10 steps for frontend tree node visualization
    dt = T / N
    u = math.exp(sigma * math.sqrt(dt))
    d = 1.0 / u
    a = math.exp(r * dt)
    p = (a - d) / (u - d)
    discount = math.exp(-r * dt)

    # 1. Build Stock Price Matrix: stock_prices[i][j]
    stock_tree = []
    for i in range(N + 1):
        step_nodes = []
        for j in range(i + 1):
            s_val = S * (u ** j) * (d ** (i - j))
            step_nodes.append(s_val)
        stock_tree.append(step_nodes)

    # 2. Build Option Values Matrix via Backward Induction: option_tree[i][j]
    option_tree = [[] for _ in range(N + 1)]
    
    # Terminal payoffs at step N
    for j in range(N + 1):
        s_val = stock_tree[N][j]
        payoff = max(0.0, s_val - K) if option_type.lower() == "call" else max(0.0, K - s_val)
        option_tree[N].append(payoff)

    # Backward pass
    for i in range(N - 1, -1, -1):
        for j in range(i + 1):
            v_up = option_tree[i + 1][j + 1]
            v_down = option_tree[i + 1][j]
            v_val = discount * (p * v_up + (1 - p) * v_down)
            option_tree[i].append(v_val)

    # 3. Build Delta Tree: delta_tree[i][j]
    delta_tree = [[] for _ in range(N)]
    for i in range(N):
        for j in range(i + 1):
            v_up = option_tree[i + 1][j + 1]
            v_down = option_tree[i + 1][j]
            s_up = stock_tree[i + 1][j + 1]
            s_down = stock_tree[i + 1][j]
            delta_val = (v_up - v_down) / (s_up - s_down) if (s_up != s_down) else 0.0
            delta_tree[i].append(delta_val)

    # Format nodes for JSON response
    levels = []
    for i in range(N + 1):
        nodes_in_level = []
        for j in range(i + 1):
            node_data = {
                "step": i,
                "index": j,
                "stock_price": round(stock_tree[i][j], 4),
                "option_value": round(option_tree[i][j], 4),
                "delta": round(delta_tree[i][j], 4) if i < N else None
            }
            nodes_in_level.append(node_data)
        levels.append(nodes_in_level)

    return {
        "levels": levels,
        "u": round(u, 6),
        "d": round(d, 6),
        "p": round(p, 6),
        "dt": round(dt, 6),
        "N": N
    }
