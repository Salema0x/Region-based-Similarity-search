FROM node:21-bullseye-slim

RUN apt update && apt upgrade && \
	apt install -y --no-install-recommends python3-venv python3-pip curl

COPY frontend-backend/ /frontend-backend/

WORKDIR /frontend-backend

RUN yarn install

# build React Frontend
RUN yarn && \
    yarn build

RUN ls /frontend-backend

# build Django Backend
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --break-system-packages -r requirements.txt

# setup database
RUN python3 manage.py makemigrations && \
    python3 manage.py migrate

EXPOSE 8000

# start webserver
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
