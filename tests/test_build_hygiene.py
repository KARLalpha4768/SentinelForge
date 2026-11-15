from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_legacy_photometry_source_forwards_to_canonical_implementation():
    forwarder = (ROOT / "output/builds/src/photometry.cpp").read_text(encoding="utf-8")

    assert '#include "cpp/photometry.cpp"' in forwarder
    assert "class Photometer" not in forwarder


def test_dockerignore_excludes_sensitive_and_generated_content():
    patterns = set((ROOT / ".dockerignore").read_text(encoding="utf-8").splitlines())

    assert {".git", ".env*", "**/node_modules/", "**/__pycache__/", "tests/", "secrets/"} <= patterns


def test_ci_runs_tests_and_does_not_swallow_unknown_cmake_failures():
    workflow = (ROOT / ".github/workflows/ci.yml").read_text(encoding="utf-8")

    assert "ruff check ." in workflow
    assert "run: pytest -q" in workflow
    assert "2>&1 || echo" not in workflow
