# Region-based image similarity search

## Usage
1. Clone the project
2. Go to app directory `cd fopra-region-based-similarity-search/project`
3. Download model and unpack `./get_model.sh`
4. Start containers:
    - Run on CPU: `docker compose up -d`
    - Or, if a GPU is available, run on GPU: `docker compose --env-file ./.env.gpu up -d`
5. Download OpenImages ES index and import data into ES: `docker compose exec project tools/import_openimages.sh`
6. Go to `127.0.0.1:80` or `http://localhost`.

  **Hint**: Changes in the codebase outside of the containers are not directly reflected inside it anymore. To apply them to the image rebuild with `docker compose build` or `docker compose up -d --build`

## Getting production-ready
0. If nessecary create a deploykey to clone the repo on the production server
1. Create an `.env`-file and copy your preferred env file (`.env.cpu`/ `.env.gpu`) inside it
2. Change every value after the `# Change in production`-comment to one that fits your setup
  - Suggestions: `Debug=False`, `AllowedHosts=<Hostname_of_the_server>, localhost, 127.0.0.1, [::1]`

## Reference

Reference to ElasticHash :

```
@InProceedings{korfhage2021elastichash,
  title="ElasticHash: Semantic Image Similarity Search by Deep Hashing with Elasticsearch",
  author={Korfhage, Nikolaus and M{\"u}hling, Markus and Freisleben, Bernd},
  booktitle="Computer Analysis of Images and Patterns",
  year="2021",
  publisher="Springer International Publishing",
  pages="14--23",
}
```