#!/usr/bin/env python3
"""
SentinelPrompt - Benchmark Evaluation CLI
Runs automated security benchmark against curated prompt injection datasets.
Measures detection accuracy, recall, false-positive rate, and latency percentiles.

Usage:
    python scripts/benchmark_runner.py
"""

import sys
import os
import json
import time
import asyncio

# Ensure stdout uses UTF-8 on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

# Ensure backend package is on Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../backend"))

from app.engine.pipeline import pipeline_instance
from app.models.schemas import AnalyzeRequest, VerdictEnum

BENCHMARK_PATH = os.path.join(os.path.dirname(__file__), "../data/seed_attacks.json")

async def run_benchmark():
    if not os.path.exists(BENCHMARK_PATH):
        print(f"Error: Dataset not found at {BENCHMARK_PATH}")
        sys.exit(1)

    with open(BENCHMARK_PATH, "r", encoding="utf-8") as f:
        cases = json.load(f)

    print("\n" + "=" * 76)
    print("🛡️   SENTINELPROMPT FIREWALL — BENCHMARK EVALUATION SUITE")
    print("=" * 76)
    print(f"Evaluating {len(cases)} test cases across 7 threat categories...")
    print("-" * 76)

    total_attacks = 0
    detected_attacks = 0
    total_benign = 0
    passed_benign = 0
    latencies = []

    results = []

    for item in cases:
        req = AnalyzeRequest(
            prompt=item["prompt"],
            context=item.get("context"),
            client_id="benchmark_cli"
        )

        start = time.perf_counter()
        res = await pipeline_instance.scan(req)
        elapsed_ms = (time.perf_counter() - start) * 1000
        latencies.append(res.total_latency_ms)

        expected = item["expected_verdict"]
        is_attack = expected in ["BLOCKED", "SUSPICIOUS"]

        passed = False
        if is_attack:
            total_attacks += 1
            if res.verdict in [VerdictEnum.BLOCKED, VerdictEnum.SUSPICIOUS]:
                detected_attacks += 1
                passed = True
        else:
            total_benign += 1
            if res.verdict == VerdictEnum.SAFE:
                passed_benign += 1
                passed = True

        status_symbol = "✅ PASS" if passed else "❌ FAIL"
        results.append({
            "id": item["id"],
            "name": item["name"],
            "category": item["category"],
            "expected": expected,
            "actual": res.verdict.value,
            "risk_score": res.risk_score,
            "latency_ms": res.total_latency_ms,
            "passed": passed
        })

        print(f"[{status_symbol}] {item['id']:<10} | {item['category']:<20} | Score: {res.risk_score:>3}/100 | {res.total_latency_ms:>5.1f}ms | {item['name'][:28]}")

    latencies.sort()
    avg_latency = sum(latencies) / len(latencies)
    p50 = latencies[int(len(latencies) * 0.50)]
    p95 = latencies[int(len(latencies) * 0.95)]
    p99 = latencies[int(len(latencies) * 0.99)]

    detection_rate = (detected_attacks / total_attacks) * 100 if total_attacks > 0 else 0
    benign_accuracy = (passed_benign / total_benign) * 100 if total_benign > 0 else 0

    print("=" * 76)
    print("📊 BENCHMARK METRICS SUMMARY")
    print("=" * 76)
    print(f"Total Test Cases:            {len(cases)}")
    print(f"Attacks Evaluated:           {total_attacks}")
    print(f"Attacks Blocked/Held:        {detected_attacks} ({detection_rate:.1f}%)")
    print(f"Benign Controls Evaluated:   {total_benign}")
    print(f"Benign Controls Clean:       {passed_benign} ({benign_accuracy:.1f}%)")
    print(f"False Positive Rate:         {(100 - benign_accuracy):.1f}%")
    print("-" * 76)
    print(f"Mean Latency:                {avg_latency:.2f} ms")
    print(f"P50 Latency:                 {p50:.2f} ms")
    print(f"P95 Latency:                 {p95:.2f} ms")
    print(f"P99 Latency:                 {p99:.2f} ms")
    print("=" * 76)

    # Save artifact
    output_path = os.path.join(os.path.dirname(__file__), "../data/benchmark_results.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "total_cases": len(cases),
            "attack_detection_rate_pct": round(detection_rate, 2),
            "benign_accuracy_pct": round(benign_accuracy, 2),
            "latency": {
                "avg_ms": round(avg_latency, 2),
                "p50_ms": round(p50, 2),
                "p95_ms": round(p95, 2),
                "p99_ms": round(p99, 2),
            },
            "cases": results
        }, f, indent=2)
    print(f"Detailed benchmark results written to: {output_path}\n")

if __name__ == "__main__":
    asyncio.run(run_benchmark())
