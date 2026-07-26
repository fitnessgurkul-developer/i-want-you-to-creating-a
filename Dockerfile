FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV HOST=0.0.0.0
ENV PORT=8000
# Matches render.yaml — Hostinger production domains only.
ENV CORS_ORIGINS=https://fitnessgurukul.app,https://www.fitnessgurukul.app,https://fitnessgurukul.co.in,https://www.fitnessgurukul.co.in,https://fitnessgurukul.in,https://www.fitnessgurukul.in

EXPOSE 8000
CMD ["python", "server.py"]
