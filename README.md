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
git clone https://github.com/adambasha0/Fobra-2023.git
cd similar-image-search-project
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
    pip install -r ./project/requirements.txt
    ```

2. Set Up Database
    ```bash
    python ./project/manage.py makemigrations
    python ./project/manage.py migrate
    ```

3. Start the APP
    ```bash
    python ./project/manage.py runserver       # start the project
    ```

At this point, the app runs at `http://127.0.0.1:8000/`.
