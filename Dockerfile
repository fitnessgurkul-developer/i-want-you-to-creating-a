FROM python:3.12-slim

WORKDIR /app

# Stdlib-only API — no pip dependencies.
COPY server.py start.py ./
COPY . .

ENV HOST=0.0.0.0
ENV PORT=8000
ENV CORS_ORIGINS=*

EXPOSE 8000
CMD ["python", "server.py"]
