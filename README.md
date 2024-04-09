# Image search using Django & React

## Docker
1. Clone the project
2. Run with docker-compose
    ```bash
    cd fopra-region-based-similarity-search
    docker compose up -d
    ```
The webserver now runs on `localhost:8000`.


## Manual Build

Download the code
```bash
git clone https://github.com/umr-ds/fopra-region-based-similarity-search.git
cd fopra-region-based-similarity-search/project
```

### 👉 Build `React Frontend`
```bash
yarn       # Install React
yarn dev   # development build (with LIVE Reload) using webpack
yarn build # production build
```

### 👉 Build `Django Backend` 
1. Install modules via `VENV`
    ```bash
    virtualenv env
    source env/bin/activate
    pip install -r ./requirements.txt
    ```
    (or on windows)
    ```bash
    python -m venv venv
    ./venv/Scripts/activate
    pip install -r ./requirements.txt
    ```

2. Set Up Database
    ```bash
    python ./manage.py makemigrations
    python ./manage.py migrate
    ```

3. Start the APP
    ```bash
    python ./manage.py runserver       # start the project
    ```

At this point, the app runs at `http://127.0.0.1:8000/`.
