FROM python:3.9-slim

# Variables de entorno
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Crear directorio de trabajo
WORKDIR /app

# Crear entorno virtual
RUN python -m venv /opt/venv

# Activar el entorno virtual
ENV PATH="/opt/venv/bin:$PATH"

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Instalar dependencias Python en el venv
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copiar código de la aplicación
COPY . .

# Exponer puerto
EXPOSE 8000

# Comando por defecto
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
