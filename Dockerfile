# syntax=docker/dockerfile:1
# Build the phone UI, compile the C++ kernel, and keep compilers out of runtime.
FROM node:22-bookworm-slim AS frontend
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim-bookworm AS wheels
ENV PIP_DISABLE_PIP_VERSION_CHECK=1 THOTH_OPENMP=1
RUN apt-get update \
    && apt-get install -y --no-install-recommends g++ libopenmpi-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /build
COPY pyproject.toml setup.py MANIFEST.in README.md ./
COPY native/ ./native/
COPY src/ ./src/
COPY --from=frontend /build/src/thoth/web/ ./src/thoth/web/
RUN python -m pip wheel --wheel-dir /wheels ".[cluster]"

FROM python:3.12-slim-bookworm AS runtime
LABEL org.opencontainers.image.title="THOTHv2 Mira Research Observatory" \
      org.opencontainers.image.source="https://github.com/rebeltechoxford/THOTHv2"
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    THOTH_CACHE_DIR=/var/lib/thoth/cache \
    THOTH_WORKSPACE_DIR=/var/lib/thoth/cache/workspace \
    OMP_NUM_THREADS=4 OPENBLAS_NUM_THREADS=1 MKL_NUM_THREADS=1 \
    OMPI_MCA_btl_vader_single_copy_mechanism=none
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 openmpi-bin \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --gid 10001 thoth \
    && useradd --uid 10001 --gid 10001 --create-home thoth \
    && mkdir -p /var/lib/thoth/cache /app \
    && chown -R thoth:thoth /var/lib/thoth /app
COPY --from=wheels /wheels/ /wheels/
RUN python -m pip install --no-index --find-links=/wheels "thoth-mira[cluster]" \
    && rm -rf /wheels
WORKDIR /app
COPY --chown=thoth:thoth examples/ ./examples/
COPY --chown=thoth:thoth scripts/docker-smoke.py ./scripts/docker-smoke.py
USER thoth
EXPOSE 8765
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=4 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8765/api/health',timeout=3)"
CMD ["thoth", "serve", "--host", "0.0.0.0", "--port", "8765"]
