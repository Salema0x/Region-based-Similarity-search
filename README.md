# Region-Based Image Similarity Search

Search for visually similar image regions using a selected area of an image. The application combines a React interface with a Django API, TensorFlow Serving, and an Elasticsearch index based on deep hashing.

## How it works

1. Upload an image or provide an image URL.
2. Select the region to search.
3. The backend processes the region and queries the image index.
4. Browse the returned matches in the web interface.

## Architecture

| Component | Responsibility |
| --- | --- |
| React | Image upload, region selection, and result display |
| Django | Upload and search API |
| TensorFlow Serving | Model inference |
| Elasticsearch | Indexed image retrieval |
| Nginx | Web entry point |
| Docker Compose | Local service orchestration |

## Local setup

Requirements: Docker with Compose, Bash, `wget`, `unzip`, and access to the external model and image-code downloads.

```bash
git clone https://github.com/Salema0x/Region-based-Similarity-search.git
cd Region-based-Similarity-search/project
bash get_model.sh
cp .env.cpu .env
docker compose up -d --build
docker compose exec project bash tools/import_openimages.sh
```

Open [localhost](http://localhost). The default web port is controlled by `APP_PORT`.

The import script downloads OpenImages codes and resets the target image index. Use it for initial setup or an intentional rebuild.

For GPU configuration, see [.env.gpu](project/.env.gpu) and the TensorFlow service in [docker-compose.yml](project/docker-compose.yml). GPU use also requires compatible host drivers and container GPU configuration; choosing the environment file alone does not enable GPU access.

## Configuration

The environment files define the model name, TensorFlow image tag, web port, and Django settings.

Before deploying beyond a local development environment, set a private `DJANGO_SECRET_KEY`, set `DJANGO_DEBUG=False`, and configure `DJANGO_ALLOWED_HOSTS`. The supplied Compose configuration disables Elasticsearch security and needs a deployment-specific access configuration.

Rebuild application images after changing source files:

```bash
docker compose up -d --build
```

## Tests

[API tests](project/api/tests.py) cover local and URL-based uploads, missing input, and valid/invalid region coordinates.

With the service dependencies running:

```bash
docker compose exec project python3 manage.py test api
```

Some tests depend on external image URLs and running services.

## Repository guide

- [Backend API](project/api/)
- [React interface](project/frontend/src/)
- [Model download script](project/get_model.sh)
- [Indexing tools](project/tools/)
- [Project documentation](documentation/)

## Research reference

The project builds on ElasticHash:

> Korfhage, Nikolaus; Mühling, Markus; Freisleben, Bernd. **ElasticHash: Semantic Image Similarity Search by Deep Hashing with Elasticsearch.** Computer Analysis of Images and Patterns, 2021, pp. 14–23.

```bibtex
@InProceedings{korfhage2021elastichash,
  title={ElasticHash: Semantic Image Similarity Search by Deep Hashing with Elasticsearch},
  author={Korfhage, Nikolaus and Mühling, Markus and Freisleben, Bernd},
  booktitle={Computer Analysis of Images and Patterns},
  year={2021},
  publisher={Springer International Publishing},
  pages={14--23}
}
```
