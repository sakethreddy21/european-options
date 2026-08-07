from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str


class OptionRequest(BaseModel):
    S: float = Field(100.0, gt=0, description="Current Spot Price (S_0)")
    K: float = Field(100.0, gt=0, description="Strike Price (K)")
    T: float = Field(1.0, gt=0, description="Time to Expiration in Years (T)")
    r: float = Field(0.05, ge=0, description="Annualized Risk-Free Rate (r e.g. 0.05 for 5%)")
    sigma: float = Field(0.20, gt=0, description="Annualized Volatility (sigma e.g. 0.20 for 20%)")
    option_type: str = Field("call", description="'call' or 'put'")
    binomial_steps: int = Field(50, ge=1, le=1000, description="Steps for Binomial Tree")
    monte_carlo_simulations: int = Field(50000, ge=100, le=1000000, description="Paths for Monte Carlo")

    @field_validator("option_type")
    @classmethod
    def validate_option_type(cls, v: str) -> str:
        val = v.lower().strip()
        if val not in ("call", "put"):
            raise ValueError("option_type must be either 'call' or 'put'")
        return val


class PriceComparisonResponse(BaseModel):
    black_scholes: Dict[str, Any]
    binomial_tree: Dict[str, Any]
    monte_carlo: Dict[str, Any]
    greeks: Dict[str, float]
    params: Dict[str, Any]
    computation_time_ms: Dict[str, float]


class BinomialTreeRequest(BaseModel):
    S: float = Field(100.0, gt=0)
    K: float = Field(100.0, gt=0)
    T: float = Field(1.0, gt=0)
    r: float = Field(0.05, ge=0)
    sigma: float = Field(0.20, gt=0)
    option_type: str = Field("call")
    N: int = Field(5, ge=1, le=15, description="Tree depth for visualization")

    @field_validator("option_type")
    @classmethod
    def validate_option_type(cls, v: str) -> str:
        val = v.lower().strip()
        if val not in ("call", "put"):
            raise ValueError("option_type must be either 'call' or 'put'")
        return val


class MonteCarloPathsRequest(BaseModel):
    S: float = Field(100.0, gt=0)
    K: float = Field(100.0, gt=0)
    T: float = Field(1.0, gt=0)
    r: float = Field(0.05, ge=0)
    sigma: float = Field(0.20, gt=0)
    option_type: str = Field("call")
    num_paths: int = Field(50, ge=5, le=200)
    time_steps: int = Field(50, ge=10, le=200)

    @field_validator("option_type")
    @classmethod
    def validate_option_type(cls, v: str) -> str:
        val = v.lower().strip()
        if val not in ("call", "put"):
            raise ValueError("option_type must be either 'call' or 'put'")
        return val


class SensitivityRequest(BaseModel):
    S: float = Field(100.0, gt=0)
    K: float = Field(100.0, gt=0)
    T: float = Field(1.0, gt=0)
    r: float = Field(0.05, ge=0)
    sigma: float = Field(0.20, gt=0)
    option_type: str = Field("call")

    @field_validator("option_type")
    @classmethod
    def validate_option_type(cls, v: str) -> str:
        val = v.lower().strip()
        if val not in ("call", "put"):
            raise ValueError("option_type must be either 'call' or 'put'")
        return val

