FROM node:21-bullseye-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip

COPY . /project/

WORKDIR /project

RUN yarn install

# build React Frontend
RUN yarn && \
    yarn build

RUN ls /project

# build Django Backend
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --break-system-packages -r requirements.txt

# setup database
RUN python3 manage.py makemigrations && \
    python3 manage.py migrate

EXPOSE 8000

# start webserver
#CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
CMD ["bash", "-c", "exec gunicorn app.wsgi:application --bind 0.0.0.0:8000 --workers ${GUNICORN_WORKERS}"]