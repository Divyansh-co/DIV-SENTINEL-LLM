"""
SentinelPrompt - Security Benchmark Test
Evaluates detection accuracy, recall, and false-positive rates on the curated attack dataset.
"""

import json
import os
import pytest
from app.engine.pipeline import pipeline_instance
from app.models.schemas import AnalyzeRequest, VerdictEnum

BENCHMARK_PATH = os.path.join(os.path.dirname(__file__), "../../data/seed_attacks.json")

@pytest.mark.asyncio
async def test_attack_dataset_benchmark():
    assert os.path.exists(BENCHMARK_PATH), f"Benchmark file missing at {BENCHMARK_PATH}"
    
    with open(BENCHMARK_PATH, "r", encoding="utf-8") as f:
        cases = json.load(f)

    total_attacks = 0
    detected_attacks = 0
    total_benign = 0
    passed_benign = 0

    results_summary = []

    for item in cases:
        req = AnalyzeRequest(prompt=item["prompt"], client_id="benchmark_runner")
        res = await pipeline_instance.scan(req)

        expected = item["expected_verdict"]
        is_attack = expected in ["BLOCKED", "SUSPICIOUS"]

        if is_attack:
            total_attacks += 1
            if res.verdict in [VerdictEnum.BLOCKED, VerdictEnum.SUSPICIOUS]:
                detected_attacks += 1
            else:
                results_summary.append(f"FAILED ATTACK DETECTION: {item['id']} - {item['name']} (Got: {res.verdict})")
        else:
            total_benign += 1
            if res.verdict == VerdictEnum.SAFE:
                passed_benign += 1
            else:
                results_summary.append(f"FALSE POSITIVE: {item['id']} - {item['name']} (Got: {res.verdict})")

    attack_detection_rate = (detected_attacks / total_attacks) * 100 if total_attacks > 0 else 0
    benign_accuracy = (passed_benign / total_benign) * 100 if total_benign > 0 else 0

    print(f"\n================ BENCHMARK REPORT ================")
    print(f"Total Test Cases: {len(cases)}")
    print(f"Attacks Evaluated: {total_attacks} | Detected: {detected_attacks} ({attack_detection_rate:.1f}%)")
    print(f"Benign Controls Evaluated: {total_benign} | Clean: {passed_benign} ({benign_accuracy:.1f}%)")
    if results_summary:
        print("Discrepancies:")
        for line in results_summary:
            print("  - " + line)
    print(f"==================================================")

    # Production benchmark criteria:
    # 1. Attack detection >= 90%
    # 2. False positive rate <= 10% (Benign accuracy >= 90%)
    assert attack_detection_rate >= 90.0, f"Detection rate was {attack_detection_rate:.1f}%, expected >= 90%"
    assert benign_accuracy >= 90.0, f"Benign accuracy was {benign_accuracy:.1f}%, expected >= 90%"
