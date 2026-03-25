# Batch Processing Service

Service de traitement batch asynchrone pour la génération de documents utilisateurs.

## Architecture

Le système suit une architecture basée sur une queue de travail asynchrone :

    participant Client
    participant API as API Server (Express)
    participant DB as MongoDB
    participant Queue
    participant Worker
    participant Metrics as Prometheus
    participant Grafana

#### Création du batch
    Client->>API: POST /batches (userIds)
    API->>DB: Insert batch (status: pending)
    API->>Queue: Enqueue job (batchId)
    API-->>Client: 201 Created

#### Traitement par le worker
    Worker->>Queue: Consume job
    Worker->>DB: Update batch (processing)

#### Génération des documents
    loop for each userId
        Worker->>Worker: Generate document
        Worker->>DB: Insert document
        Worker->>Metrics: Increment documents_generated_total
    end

####  Finalisation du batch
    Worker->>DB: Update batch (completed)
    Worker->>Metrics: Observe batch_processing_duration_seconds

#### Monitoring
    Metrics->>API: GET /metrics
    Grafana->>Metrics: Query metrics

## Fonctionnement
Création du batch : L'API reçoit une liste d'identifiants utilisateurs via POST /batches
Mise en file d'attente : Le job est placé dans une queue pour un traitement asynchrone
Traitement : Le worker traite chaque utilisateur et génère un document associé
Persistance : Les documents générés sont stockés dans MongoDB
Monitoring : Les métriques sont exposées via Prometheus et visualisées dans Grafana

## Installation
### Prérequis
Docker

Docker Compose

### Démarrage
bash
docker compose up

L'application sera accessible sur :

API : http://localhost:3000

Grafana : http://localhost:3001

Prometheus : http://localhost:9090

## Documentation API
La documentation interactive Swagger est disponible à l'adresse :

http://localhost:3000/api-docs

### Métriques disponibles
Métrique	                            Description
documents_generated_total	            Nombre total de documents générés
batch_processing_duration_seconds	    Durée de traitement des batches

### Stack technique
API : Express.js

Base de données : MongoDB

Queue : Système de file d'attente asynchrone

Monitoring : Prometheus + Grafana