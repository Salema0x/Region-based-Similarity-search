namespace=project
kubectl config set-context --current --namespace=${namespace}
kubectl apply -f project-deploy.yaml
