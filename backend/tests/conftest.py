import pytest
import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure backend root is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def sample_option_params():
    return {
        "S": 100.0,
        "K": 100.0,
        "T": 1.0,
        "r": 0.05,
        "sigma": 0.20,
        "option_type": "call",
        "binomial_steps": 50,
        "monte_carlo_simulations": 10000
    }
