import pytest


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "models" in data


def test_healthz_endpoint(client):
    response = client.get("/healthz")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "environment" in data


def test_price_comparison_endpoint(client, sample_option_params):
    response = client.post("/api/price", json=sample_option_params)
    assert response.status_code == 200
    data = response.json()
    
    assert "black_scholes" in data
    assert "binomial_tree" in data
    assert "monte_carlo" in data
    assert "greeks" in data
    assert "computation_time_ms" in data


def test_binomial_tree_endpoint(client):
    payload = {
        "S": 100.0,
        "K": 100.0,
        "T": 1.0,
        "r": 0.05,
        "sigma": 0.20,
        "option_type": "call",
        "N": 3
    }
    response = client.post("/api/binomial-tree", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "levels" in data
    assert "u" in data
    assert "d" in data
    assert "p" in data
    assert len(data["levels"]) == 4  # N=3 steps has 4 levels (0 to 3)



def test_monte_carlo_paths_endpoint(client):
    payload = {
        "S": 100.0,
        "K": 100.0,
        "T": 1.0,
        "r": 0.05,
        "sigma": 0.20,
        "option_type": "call",
        "num_paths": 10,
        "time_steps": 20
    }
    response = client.post("/api/monte-carlo-paths", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "paths" in data
    assert len(data["paths"]) == 10


def test_convergence_endpoint(client, sample_option_params):
    response = client.post("/api/convergence", json=sample_option_params)
    assert response.status_code == 200
    data = response.json()
    assert "black_scholes_benchmark" in data
    assert "binomial_convergence" in data
    assert "monte_carlo_convergence" in data


def test_sensitivity_endpoint(client):
    payload = {
        "S": 100.0,
        "K": 100.0,
        "T": 1.0,
        "r": 0.05,
        "sigma": 0.20,
        "option_type": "call"
    }
    response = client.post("/api/sensitivity", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "spot_sensitivity" in data
    assert "volatility_sensitivity" in data
    assert "heatmap" in data


def test_invalid_option_type_validation(client, sample_option_params):
    invalid_params = sample_option_params.copy()
    invalid_params["option_type"] = "invalid_option"
    response = client.post("/api/price", json=invalid_params)
    assert response.status_code == 422
