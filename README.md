# [Image search using Django & React]

Project is bundled with React

<br />

> Feature: 
  
<br />

## Docker
1. Clone the project
2. Run with docker-compose
    ```bash
    cd fopra-region-based-similarity-search
    docker compose up -d
    ```


## Manual Build

> Download the code 

```bash
$ git clone https://github.com/adambasha0/Fobra-2023.git
$ cd similar-image-search-project
```

<br />

### 👉 Build `React Frontend`

```bash
$ yarn       # Install React
$ yarn dev   # development build (with LIVE Reload) using webpack
$ yarn build # production build
```

<br />

### 👉 Build `Django Backend` 

> Install modules via `VENV`  

```bash
$ virtualenv env
$ source env/bin/activate
$ pip install -r requirements.txt
```

<br />

> Set Up Database

```bash
$ python manage.py makemigrations
$ python manage.py migrate
```

<br />

> Start the APP

```bash
$ python manage.py runserver       # start the project
```

At this point, the app runs at `http://127.0.0.1:8000/`. 

<br />
