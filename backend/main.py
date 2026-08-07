import logging
import time
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from typing import Dict, Any, List, cast

from config import settings
from schemas import (
    OptionRequest,
    PriceComparisonResponse,
    BinomialTreeRequest,
    MonteCarloPathsRequest,
    SensitivityRequest,
    HealthResponse
)
from models.black_scholes import black_scholes_price, black_scholes_greeks
from models.binomial_tree import binomial_tree_price, generate_binomial_tree_structure
from models.monte_carlo import monte_carlo_price, generate_monte_carlo_paths

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT_DEFAULT])

app = FastAPI(
    title=settings.APP_NAME,
    description="Full-stack simulation environment comparing Black-Scholes, Binomial Tree (CRR), and Monte Carlo (GBM) models.",
    version=settings.VERSION,
    debug=settings.DEBUG
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, cast(Any, _rate_limit_exceeded_handler))

# Configure CORS dynamically from settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True if "*" not in settings.ALLOWED_ORIGINS else False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start_time) * 1000.0
    logger.info(f"{request.method} {request.url.path} -> HTTP {response.status_code} ({duration_ms:.2f}ms)")
    return response


@app.get("/", response_model=Dict[str, Any])
def read_root():
    return {
        "status": "online",
        "service": settings.APP_NAME,
        "version": settings.VERSION,
        "models": ["Black-Scholes-Merton", "Cox-Ross-Rubinstein Binomial Tree", "Monte Carlo GBM"]
    }


@app.get("/healthz", response_model=HealthResponse)
def health_check():
    """
    K8s / Load Balancer readiness and liveness probe.
    """
    return HealthResponse(
        status="healthy",
        service=settings.APP_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT
    )



@app.post("/api/price", response_model=PriceComparisonResponse)
def calculate_all_prices(req: OptionRequest):
    """
    Computes option price across all three models simultaneously and measures computation latency.
    """
    try:
        # 1. Black-Scholes Model
        t0 = time.perf_counter()
        bs_res = black_scholes_price(
            S=req.S, K=req.K, T=req.T, r=req.r, sigma=req.sigma, option_type=req.option_type
        )
        bs_time = (time.perf_counter() - t0) * 1000.0  # in ms

        # Greeks
        greeks = black_scholes_greeks(
            S=req.S, K=req.K, T=req.T, r=req.r, sigma=req.sigma, option_type=req.option_type
        )

        # 2. Binomial Tree Model
        t0 = time.perf_counter()
        bt_res = binomial_tree_price(
            S=req.S, K=req.K, T=req.T, r=req.r, sigma=req.sigma,
            N=req.binomial_steps, option_type=req.option_type
        )
        bt_time = (time.perf_counter() - t0) * 1000.0

        # 3. Monte Carlo Simulation Model
        t0 = time.perf_counter()
        mc_res = monte_carlo_price(
            S=req.S, K=req.K, T=req.T, r=req.r, sigma=req.sigma,
            num_simulations=req.monte_carlo_simulations, option_type=req.option_type, seed=42
        )
        mc_time = (time.perf_counter() - t0) * 1000.0

        return PriceComparisonResponse(
            black_scholes=bs_res,
            binomial_tree=bt_res,
            monte_carlo=mc_res,
            greeks=greeks,
            params=req.model_dump(),
            computation_time_ms={
                "black_scholes": round(bs_time, 3),
                "binomial_tree": round(bt_time, 3),
                "monte_carlo": round(mc_time, 3)
            }
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/binomial-tree")
def get_binomial_tree_visual(req: BinomialTreeRequest):
    """
    Returns full node lattice data for step-by-step visual rendering.
    """
    try:
        tree_data = generate_binomial_tree_structure(
            S=req.S, K=req.K, T=req.T, r=req.r, sigma=req.sigma,
            N=req.N, option_type=req.option_type
        )
        return tree_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/monte-carlo-paths")
def get_monte_carlo_paths(req: MonteCarloPathsRequest):
    """
    Returns simulated asset price paths over discrete time steps for chart rendering.
    """
    try:
        paths_data = generate_monte_carlo_paths(
            S=req.S, K=req.K, T=req.T, r=req.r, sigma=req.sigma,
            num_paths=req.num_paths, time_steps=req.time_steps,
            option_type=req.option_type, seed=42
        )
        return paths_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/convergence")
def get_convergence_analysis(req: OptionRequest):
    """
    Generates convergence trajectories comparing Binomial Tree steps and Monte Carlo simulation
    sample sizes against the theoretical Black-Scholes benchmark.
    """
    try:
        # Theoretical Black-Scholes price benchmark
        bs_benchmark = black_scholes_price(
            S=req.S, K=req.K, T=req.T, r=req.r, sigma=req.sigma, option_type=req.option_type
        )["price"]

        # 1. Binomial Tree Convergence Sweep (N = 5 to 150)
        tree_steps = [5, 10, 15, 20, 30, 40, 50, 75, 100, 150, 200]
        tree_convergence = []
        for n in tree_steps:
            price = binomial_tree_price(
                S=req.S, K=req.K, T=req.T, r=req.r, sigma=req.sigma, N=n, option_type=req.option_type
            )["price"]
            tree_convergence.append({
                "steps": n,
                "price": round(price, 4),
                "error": round(abs(price - bs_benchmark), 4)
            })

        # 2. Monte Carlo Convergence Sweep (M = 500 to 100,000)
        mc_sizes = [500, 1000, 2500, 5000, 10000, 25000, 50000, 100000]
        mc_convergence = []
        for m in mc_sizes:
            res = monte_carlo_price(
                S=req.S, K=req.K, T=req.T, r=req.r, sigma=req.sigma,
                num_simulations=m, option_type=req.option_type, seed=42
            )
            mc_convergence.append({
                "simulations": m,
                "price": round(res["price"], 4),
                "ci_lower": round(res["ci_lower"], 4),
                "ci_upper": round(res["ci_upper"], 4),
                "error": round(abs(res["price"] - bs_benchmark), 4)
            })

        return {
            "black_scholes_benchmark": round(bs_benchmark, 4),
            "binomial_convergence": tree_convergence,
            "monte_carlo_convergence": mc_convergence
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/sensitivity")
def get_sensitivity_analysis(req: SensitivityRequest):
    """
    Generates parameter sensitivity data:
    1. Spot Price Sensitivity (S from 70% to 130% of S0)
    2. Volatility Sensitivity (sigma from 5% to 60%)
    3. Maturity Sensitivity (T from 0.1 to 3.0 years)
    4. 2D Heatmap Grid (Spot Price vs Volatility matrix)
    """
    try:
        # 1. Spot Price Sweep
        spot_range = [round(req.S * factor, 2) for factor in [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3]]
        spot_sensitivity = []
        for spot in spot_range:
            p_bs = black_scholes_price(S=spot, K=req.K, T=req.T, r=req.r, sigma=req.sigma, option_type=req.option_type)["price"]
            p_bt = binomial_tree_price(S=spot, K=req.K, T=req.T, r=req.r, sigma=req.sigma, N=50, option_type=req.option_type)["price"]
            spot_sensitivity.append({
                "spot": spot,
                "black_scholes": round(p_bs, 4),
                "binomial_tree": round(p_bt, 4)
            })

        # 2. Volatility Sweep
        vol_range = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.50]
        vol_sensitivity = []
        for vol in vol_range:
            p_bs = black_scholes_price(S=req.S, K=req.K, T=req.T, r=req.r, sigma=vol, option_type=req.option_type)["price"]
            vol_sensitivity.append({
                "volatility": round(vol * 100, 1),
                "black_scholes": round(p_bs, 4)
            })

        # 3. 2D Heatmap Grid: Spot vs Volatility
        spots_heatmap = [round(req.S * f, 1) for f in [0.8, 0.9, 1.0, 1.1, 1.2]]
        vols_heatmap = [0.10, 0.20, 0.30, 0.40, 0.50]
        heatmap_grid = []
        for spot in spots_heatmap:
            row = {"spot": spot}
            for vol in vols_heatmap:
                price = black_scholes_price(S=spot, K=req.K, T=req.T, r=req.r, sigma=vol, option_type=req.option_type)["price"]
                row[f"vol_{int(vol*100)}"] = round(price, 2)
            heatmap_grid.append(row)

        return {
            "spot_sensitivity": spot_sensitivity,
            "volatility_sensitivity": vol_sensitivity,
            "heatmap": {
                "spots": spots_heatmap,
                "vols": [int(v*100) for v in vols_heatmap],
                "grid": heatmap_grid
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
