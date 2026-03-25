Batch Processing – Sequence Diagram

sequenceDiagram
    participant Client
    participant API as API Server (Express)
    participant DB as MongoDB
    participant Queue
    participant Worker
    participant Metrics as Prometheus
    participant Grafana

    %% Create batch
    Client->>API: POST /batches (userIds)
    API->>DB: Insert batch (status: pending)
    API->>Queue: Enqueue job (batchId)
    API-->>Client: 201 Created

    %% Worker processing
    Worker->>Queue: Consume job
    Worker->>DB: Update batch (processing)

    %% Loop documents
    loop for each userId
        Worker->>Worker: Generate document
        Worker->>DB: Insert document
        Worker->>Metrics: Increment documents_generated_total
    end

    %% Finish batch
    Worker->>DB: Update batch (completed)
    Worker->>Metrics: Observe batch_processing_duration_seconds

    %% Monitoring
    Metrics->>API: GET /metrics
    Grafana->>Metrics: Query metrics


Un batch est créé via l’API avec une liste de userIds
Le job est envoyé dans une queue pour traitement asynchrone
Le worker traite chaque utilisateur et génère un document
Les documents sont stockés dans MongoDB
Les métriques sont exposées via Prometheus et visualisées dans Grafana

Installation

docker compose up

Documentation

/api-docs : Swagger Docs


