import numpy as np

def run_montecarlo(probs, n_sims=10000):

    results = np.random.choice(
        ['A', 'D', 'H'],
        size=n_sims,
        p=probs
    )

    return {
        "A": int(np.sum(results == "A")),
        "D": int(np.sum(results == "D")),
        "H": int(np.sum(results == "H"))
    }