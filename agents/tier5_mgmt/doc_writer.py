"""
SentinelForge Agent 18: Doc Writer
Generates API documentation, architecture decision records, and runbooks.
"""
import sys, os, json, time
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from pathlib import Path
from config import OUTPUT_DIR, AGENTS
from db import log_action, register_artifact, get_conn

AGENT_ID = 18
DOC_DIR = OUTPUT_DIR / "reports"

def execute(task):
    DOC_DIR.mkdir(parents=True, exist_ok=True)
    generate_api_docs(task)
    generate_adr(task)
    return True


def generate_api_docs(task):
    """Generate API documentation from source files."""
    src_dir = OUTPUT_DIR / "builds" / "src"
    filepath = DOC_DIR / "api_documentation.md"

    doc = "# SentinelForge Edge Pipeline - API Documentation\n\n"
    doc += f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S UTC')}\n\n"
    doc += "## Table of Contents\n\n"

    if src_dir.exists():
        files = sorted(src_dir.iterdir())
        for f in files:
            doc += f"- [{f.name}](#{f.stem})\n"
        doc += "\n---\n\n"

        for f in files:
            if not f.is_file():
                continue
            content = f.read_text(encoding="utf-8", errors="replace")
            lines = content.splitlines()
            doc += f"## {f.name}\n\n"
            doc += f"**Language:** {f.suffix[1:].upper()}\n"
            doc += f"**Lines:** {len(lines)}\n\n"

            # Extract doc comments and function signatures
            if f.suffix in ['.py']:
                doc += _extract_python_docs(content)
            elif f.suffix in ['.cu', '.cpp']:
                doc += _extract_cpp_docs(content)
            elif f.suffix in ['.yml', '.yaml']:
                doc += f"```yaml\n{content[:500]}\n...\n```\n"
            doc += "\n---\n\n"

    filepath.write_text(doc, encoding="utf-8")
    lines = len(doc.splitlines())
    register_artifact(task["id"], AGENT_ID, str(filepath), "markdown", lines, "1.0")
    log_action(AGENT_ID, "GENERATE_DOCS", task["id"],
               details={"file": str(filepath), "lines": lines},
               files_modified=[str(filepath)], status="SUCCESS")
    print(f"           -> Generated api_documentation.md ({lines} lines)")


def _extract_python_docs(content: str) -> str:
    """Extract classes, functions, and docstrings from Python source."""
    doc = ""
    lines = content.splitlines()
    in_docstring = False
    docstring_lines = []

    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("class "):
            doc += f"### `{stripped.rstrip(':')}`\n\n"
        elif stripped.startswith("def "):
            doc += f"- `{stripped.rstrip(':')}`\n"
        elif stripped.startswith('"""') and not in_docstring:
            if stripped.endswith('"""') and len(stripped) > 3:
                doc += f"  > {stripped[3:-3]}\n"
            else:
                in_docstring = True
                docstring_lines = [stripped[3:]]
        elif in_docstring:
            if '"""' in stripped:
                docstring_lines.append(stripped.replace('"""', ''))
                doc += "  > " + " ".join(docstring_lines).strip() + "\n"
                in_docstring = False
                docstring_lines = []
            else:
                docstring_lines.append(stripped)
    return doc + "\n"


def _extract_cpp_docs(content: str) -> str:
    """Extract structs, classes, and Doxygen comments from C++/CUDA source."""
    doc = ""
    lines = content.splitlines()
    in_comment = False

    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("/**"):
            in_comment = True
            doc += "\n"
        elif in_comment:
            if stripped.startswith("*/"):
                in_comment = False
            else:
                clean = stripped.lstrip("* ")
                if clean:
                    doc += f"> {clean}\n"
        elif stripped.startswith("struct ") or stripped.startswith("class "):
            doc += f"\n### `{stripped.rstrip(' {')}`\n\n"
        elif ("__global__" in stripped or "bool " in stripped or
              "int " in stripped or "void " in stripped or "float " in stripped):
            if "(" in stripped and ";" not in stripped:
                func_name = stripped.split("(")[0].split()[-1] if stripped.split("(") else ""
                if func_name and not func_name.startswith("_"):
                    doc += f"- `{stripped.split(')')[0]})`\n"
    return doc + "\n"


def generate_adr(task):
    """Generate Architecture Decision Record."""
    filepath = DOC_DIR / "adr_001_edge_architecture.md"

    doc = """# ADR-001: Edge GPU Processing Architecture

## Status: ACCEPTED

## Context
Slingshot's observatory network generates 32MB frames at each of 20+ sites.
Uploading raw frames requires ~50Mbps per site, impossible over satellite links.
Cloud-only processing adds 500ms+ latency, unacceptable for real-time tracking.

## Decision
Deploy NVIDIA Jetson AGX Orin edge GPU boxes at each site.
Process frames locally: calibrate -> detect -> correlate -> upload detections only.

## Consequences
### Positive
- Bandwidth reduction: 32MB raw -> 60KB detections (99.8% reduction)
- Latency: <500ms end-to-end (vs 2-5s cloud-only)
- Satellite sites become viable for real-time operations
- Offline capability: sites continue observing during network outages

### Negative
- Hardware cost: ~$5K per site ($100K for 20 sites)
- Maintenance: remote GPU troubleshooting is harder than cloud
- Code complexity: must maintain both edge and cloud pipelines
- Power: 300W per edge box requires reliable power at remote sites

### Mitigations
- Docker containerization for consistent deployment
- OTA updater for remote software updates
- Watchdog service for automatic restart
- UPS + generator for power resilience

## Alternatives Considered
1. **Cloud-only**: Rejected (bandwidth, latency)
2. **FPGA**: Rejected (development cost, flexibility)
3. **CPU-only edge**: Rejected (insufficient throughput)
"""

    filepath.write_text(doc, encoding="utf-8")
    lines = len(doc.splitlines())
    register_artifact(task["id"], AGENT_ID, str(filepath), "markdown", lines, "1.0")
    log_action(AGENT_ID, "GENERATE_DOCS", task["id"],
               details={"file": str(filepath)},
               files_modified=[str(filepath)], status="SUCCESS")
    print(f"           -> Generated adr_001_edge_architecture.md ({lines} lines)")
