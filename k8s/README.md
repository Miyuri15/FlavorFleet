# Kubernetes Configuration for FlavorFleet

This directory contains Kubernetes manifests for deploying the FlavorFleet application.

## Prerequisites

- Kubernetes cluster
- kubectl installed
- Docker images built and pushed to a container registry

## Deployment Steps

1. Set your Docker registry:

```bash
export DOCKER_REGISTRY=your-registry.com
```

2. Apply the ConfigMap:

```bash
kubectl apply -f configmap.yaml
```

3. Deploy the backend:

```bash
kubectl apply -f backend-deployment.yaml
```

4. Deploy the frontend:

```bash
kubectl apply -f frontend-deployment.yaml
```

5. Verify the deployments:

```bash
kubectl get deployments
kubectl get services
kubectl get pods
```

## Accessing the Application

- Frontend will be available through the LoadBalancer service
- Backend is accessible within the cluster at `http://backend-service`

## Scaling

To scale the deployments:

```bash
kubectl scale deployment frontend-deployment --replicas=3
kubectl scale deployment backend-deployment --replicas=3
```

## Monitoring

To view logs:

```bash
kubectl logs -f deployment/frontend-deployment
kubectl logs -f deployment/backend-deployment
```
