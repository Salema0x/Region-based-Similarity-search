FROM node:21-alpine

RUN apk update && apk upgrade && \
	apk add --no-cache py-virtualenv py-pip curl

COPY frontend-backend/ /frontend-backend/

WORKDIR /frontend-backend

# load node_modules
RUN npm install

# build React Frontend
RUN yarn
RUN yarn build

# build Django Backend
RUN virtualenv env
RUN source env/bin/activate
RUN pip install --break-system-packages -r requirements.txt

# setup database
RUN python manage.py makemigrations
RUN python manage.py migrate

EXPOSE 8000

# start webserver
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
