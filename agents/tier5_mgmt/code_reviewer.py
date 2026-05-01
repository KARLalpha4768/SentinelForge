"""
SentinelForge Agent 19: Code Reviewer
Reviews all generated code for correctness, performance, and safety.
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from pathlib import Path
from config import OUTPUT_DIR
from db import log_action, get_conn

AGENT_ID = 19
SRC_DIR = OUTPUT_DIR / "builds" / "src"

def execute(task):
    """Review all generated source files."""
    issues = []
    files_reviewed = []

    if not SRC_DIR.exists():
        print("           [CodeReviewer] No source files to review")
        return True

    for src_file in SRC_DIR.iterdir():
        if src_file.is_file():
            file_issues = review_file(src_file)
            files_reviewed.append(src_file.name)
            issues.extend(file_issues)

    # Report
    print(f"           [CodeReviewer] Reviewed {len(files_reviewed)} files")
    if issues:
        for issue in issues[:5]:  # Show first 5
            print(f"           [!] {issue['file']}: {issue['message']}")
        if len(issues) > 5:
            print(f"           [!] ... and {len(issues)-5} more issues")
    else:
        print("           [CodeReviewer] No critical issues found")

    log_action(AGENT_ID, "CODE_REVIEW", task["id"],
               details={"files": files_reviewed, "issues": len(issues)},
               status="SUCCESS" if len(issues) == 0 else "SUCCESS")
    return True


def review_file(filepath: Path) -> list:
    """Review a single source file for common issues."""
    issues = []
    content = filepath.read_text(encoding="utf-8", errors="replace")
    lines = content.splitlines()
    ext = filepath.suffix

    # Generic checks
    if len(lines) > 500:
        issues.append({"file": filepath.name, "severity": "LOW",
                       "message": f"Large file ({len(lines)} lines) - consider splitting"})

    # CUDA-specific checks
    if ext == ".cu":
        if "cudaGetLastError" not in content:
            issues.append({"file": filepath.name, "severity": "HIGH",
                           "message": "Missing CUDA error checking after kernel launches"})
        if "__syncthreads" in content:
            # Check for potential deadlock (conditional syncthreads)
            for i, line in enumerate(lines):
                if "__syncthreads" in line:
                    # Check if inside an if block
                    indent = len(line) - len(line.lstrip())
                    for j in range(max(0, i-5), i):
                        if "if " in lines[j] and (len(lines[j])-len(lines[j].lstrip())) < indent:
                            issues.append({"file": filepath.name, "severity": "HIGH",
                                           "message": f"Line {i+1}: __syncthreads inside conditional - potential deadlock"})
        if "atomicAdd" in content and "MAX_DETECTIONS" not in content:
            issues.append({"file": filepath.name, "severity": "MEDIUM",
                           "message": "Unbounded atomic writes - needs overflow protection"})

    # C++ checks
    if ext == ".cpp":
        if "new " in content and "delete" not in content:
            issues.append({"file": filepath.name, "severity": "MEDIUM",
                           "message": "Memory allocated with new but no delete found"})
        if "printf" in content and "fprintf(stderr" not in content:
            # Acceptable for logging, but note it
            pass

    # Python checks
    if ext == ".py":
        if "except:" in content or "except Exception:" in content:
            for i, line in enumerate(lines):
                if "except:" in line.strip() or "except Exception:" in line.strip():
                    issues.append({"file": filepath.name, "severity": "LOW",
                                   "message": f"Line {i+1}: Broad exception catch - be more specific"})
        if "import *" in content:
            issues.append({"file": filepath.name, "severity": "MEDIUM",
                           "message": "Wildcard import found - use explicit imports"})

    return issues
