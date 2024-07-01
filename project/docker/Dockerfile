FROM node:21-bullseye-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip wget && \
    apt-get autoremove -y

COPY . /project/

WORKDIR /project

# create env for build only
ENV DJANGO_DEBUG=True
ENV DJANGO_SECRET_KEY=changeme
ENV DJANGO_ALLOWED_HOSTS='localhost 127.0.0.1 [::1]'

RUN yarn install

# build React Frontend
RUN yarn && \
    yarn build

# build Django Backend
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --break-system-packages -r requirements.txt

# setup database
RUN python3 manage.py makemigrations && \
    python3 manage.py migrate

# start webserver
CMD ["bash", "-c", "exec gunicorn app.wsgi:application --bind 0.0.0.0:8000 --workers ${GUNICORN_WORKERS}"]