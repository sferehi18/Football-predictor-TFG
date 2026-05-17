# Usamos exactamente la rama de Python 3.12 que tenías en Colab
FROM python:3.12-slim

# Configuraciones para que Python no genere basura y los logs salgan limpios
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Instalamos dependencias básicas del sistema que algunas librerías de IA necesitan
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiamos el archivo de requerimientos y lo instalamos
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos todo el código de nuestra API, modelos y datos
COPY . .

# Exponemos el puerto por el que se comunicará React
EXPOSE 8000

# Lanzamos el servidor web
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]