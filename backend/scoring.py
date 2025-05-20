# backend/scoring.py
import pandas as pd

def score_csv(file_path: str) -> float:
    df = pd.read_csv(file_path)
    # Placeholder logic: score = number of rows
    return float(len(df))
