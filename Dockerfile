# SentinelForge — Multi-stage Dockerfile
# Stage 1: Science pipeline (Python)
# Stage 2: Operations Center (static frontend)

# ── Stage 1: Science Pipeline ────────────────────────
FROM python:3.11-slim AS science

WORKDIR /app

# Install system deps for NumPy/PyTorch
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Verify pipeline on build
RUN python -c "import torch; print(f'PyTorch {torch.__version__}')"

ENV PYTHONIOENCODING=utf-8
ENV PYTHONUNBUFFERED=1

ENTRYPOINT ["python"]
CMD ["main.py"]

# ── Stage 2: Ops Center (static file server) ─────────
FROM python:3.11-slim AS ops-center

WORKDIR /app/frontend

COPY frontend/ .

EXPOSE 9876

CMD ["python", "-m", "http.server", "9876"]

# ── Stage 3: Digital Twin API ─────────────────────────
FROM python:3.11-slim AS digital-twin

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    fastapi uvicorn websockets

COPY . .

EXPOSE 8001
ENV PYTHONIOENCODING=utf-8

CMD ["uvicorn", "src.api.twin_ws:app", "--host", "0.0.0.0", "--port", "8001"]
