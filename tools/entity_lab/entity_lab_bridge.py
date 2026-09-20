import json
from pathlib import Path
import contextlib

import sys

PROJECT_ROOT = Path(__file__).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


ENTITY_PROFILE_SCRIPT = (
    Path(__file__).resolve().parent / "entity_profile_test.py"
)

def serialize_resolution(resolution):
    return list(resolution.values())


def analyze_text(text):
    namespace = {
        "text": text
    }

    code = ENTITY_PROFILE_SCRIPT.read_text(encoding="utf-8")

    with contextlib.redirect_stdout(sys.stderr):
        exec(
            compile(
                code,
                str(ENTITY_PROFILE_SCRIPT),
                "exec"
            ),
            namespace
        )

    return {
        "resolution": serialize_resolution(
            namespace.get("resolution", {})
        ),
        "evidence_records": namespace.get("evidence_records", []),
        "ai_escalation_candidates": namespace.get(
            "ai_escalation_candidates",
            []
        ),
        "ai_escalation_skipped": namespace.get(
            "ai_escalation_skipped",
            []
        )
    }


if __name__ == "__main__":
    import sys

    text = sys.stdin.read()

    result = analyze_text(text)

    print(json.dumps(result, ensure_ascii=False, default=str))
