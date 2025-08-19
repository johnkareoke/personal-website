FROM python:3.7-slim

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose port
EXPOSE 5001

# Set environment variables
ENV FLASK_APP=server.py
ENV FLASK_DEBUG=0

# Run the application
CMD ["python", "server.py"]
