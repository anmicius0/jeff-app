# Jeff App — AWS Backend Reference

Built August 2026, region `us-east-1`, account `472424833121`.

## Architecture Overview

```
                 ┌─────────────────────────────────────────────┐
 Browser / curl  │  API Gateway HTTP API (JeffHttpApi)        │
 ───────────────▶│  POST /workouts                            │
   HTTPS         │  GET  /workouts   (CORS enabled)           │
                 └──────────────┬──────────────────────────────┘
                                │ Lambda proxy integration (AWS_PROXY, payload 2.0)
                                ▼
                 ┌─────────────────────────────────────────────┐
                 │  Lambda  JeffApiHandler  (Python 3.12)      │
                 │  no VPC, 30s timeout, 128MB                │
                 └──────────────┬──────────────────────────────┘
                                │ IAM: jeff-api-handler-role (DynamoDB + logs)
                                ▼
                 ┌─────────────────────────────────────────────┐
                 │  DynamoDB  JeffLogs  (On-Demand / Free Tier)│
                 │  PK: Date  (String)                         │
                 │  SK: WorkoutName#Set  (String)              │
                 └─────────────────────────────────────────────┘
```

The Lambda reads/writes a DynamoDB table. API Gateway translates HTTP requests into
Lambda events and back. No VPC is involved — everything runs on AWS-managed, public
services.

## Resources

| Resource         | Name               | Details                                                    |
|------------------|--------------------|------------------------------------------------------------|
| DynamoDB table   | `JeffLogs`         | On-demand (pay-per-request, Free Tier eligible). PK `Date` (S), SK `WorkoutName#Set` (S) |
| IAM role         | `jeff-api-handler-role` | Lambda trust policy + inline `JeffLogsAccess` (scoped to table) + `AWSLambdaBasicExecutionRole` |
| Lambda function  | `JeffApiHandler`   | Python 3.12, handler `lambda_function.lambda_handler`, no VPC, 30s timeout, 128 MB |
| HTTP API         | `JeffHttpApi`      | API Gateway HTTP API, id `6ji8vpvlni`, stage `prod` (auto-deploy), CORS enabled |

## Data Backend

### DynamoDB table `JeffLogs`

Key schema (single-table design):

- **Partition key:** `Date` — String, e.g. `"2026-08-23"`
- **Sort key:** `WorkoutName#Set` — String, e.g. `"Bench Press#1"`

The composite sort key `WorkoutName#Set` lets you store multiple named sets per date.
Each record also carries the split attributes for convenience:

Example item:

```json
{
  "Date": "2026-08-23",
  "WorkoutName#Set": "Bench Press#1",
  "WorkoutName": "Bench Press",
  "Set": 1,
  "Weight": "135",
  "Reps": "10"
}
```

- All records for one date are stored under the same partition key, so querying by
  date is fast and returns sets sorted by the sort key.
- The handler accepts arbitrary extra fields (e.g. `Weight`, `Reps`) and stores them
  as-is on the item.

## API

Default endpoint URL (stage `prod` — the `/prod` prefix is required):

```
https://6ji8vpvlni.execute-api.us-east-1.amazonaws.com/prod/workouts
```

### Create a workout (POST)

```
POST /prod/workouts
Content-Type: application/json
```

Request body:

```json
{
  "Date": "2026-08-23",
  "WorkoutName": "Bench Press",
  "Set": 1,
  "Weight": "135",
  "Reps": "10"
}
```

Required fields: `Date`, `WorkoutName`, `Set` (set is converted to a number).
Any other fields are stored verbatim.

Response: `201 Created`

```json
{
  "message": "Workout saved",
  "item": {
    "Date": "2026-08-23",
    "WorkoutName#Set": "Bench Press#1",
    "WorkoutName": "Bench Press",
    "Set": 1,
    "Weight": "135",
    "Reps": "10"
  }
}
```

### List workouts (GET)

Get all workouts:

```
GET /prod/workouts
```

Get workouts for a specific date:

```
GET /prod/workouts?Date=2026-08-23
```

Response: `200 OK`

```json
{
  "workouts": [
    {
      "Set": 1,
      "Date": "2026-08-23",
      "Reps": "10",
      "WorkoutName": "Bench Press",
      "Weight": "135",
      "WorkoutName#Set": "Bench Press#1"
    }
  ]
}
```

### Delete workouts / sets / sessions (DELETE)

Delete a specific set:

```
DELETE /prod/workouts
Content-Type: application/json

{"Date": "2026-08-23", "WorkoutName": "Bench Press", "Set": 1}
```

Delete all sets for an exercise:

```
DELETE /prod/workouts
Content-Type: application/json

{"Date": "2026-08-23", "WorkoutName": "Bench Press"}
```

Delete an entire session:

```
DELETE /prod/workouts
Content-Type: application/json

{"Date": "2026-08-23"}
```

Response: `200 OK`

## Usage Examples

### cURL

```bash
BASE="https://6ji8vpvlni.execute-api.us-east-1.amazonaws.com/prod/workouts"

# Create a workout
curl -s -X POST "$BASE" \
  -H "Content-Type: application/json" \
  -d '{"Date":"2026-08-23","WorkoutName":"Bench Press","Set":1,"Weight":"135","Reps":"10"}'

# List all workouts
curl -s "$BASE"

# List workouts for a date
curl -s "$BASE?Date=2026-08-23"
```

### JavaScript (fetch)

```js
const BASE = "https://6ji8vpvlni.execute-api.us-east-1.amazonaws.com/prod/workouts";

// Create
const res = await fetch(BASE, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ Date: "2026-08-23", WorkoutName: "Bench Press", Set: 1, Weight: 135, Reps: 10 }),
});

// List by date
const list = await fetch(`${BASE}?Date=2026-08-23`).then((r) => r.json());
```

## CORS

CORS is enabled on the API (`AllowOrigins: *`) and the Lambda returns CORS headers on
every response. The `OPTIONS` preflight returns `204`. This makes the API callable
from any browser frontend (e.g. a local dev server).

## Troubleshooting

- **`{"message":"Not Found"}` on `/workouts`** — use the stage prefix `/prod/workouts`; there is no `$default` stage.
- **`Object of type Decimal is not JSON serializable`** — resolved via a `Decimal` serializer in the Lambda; if it reappears, redeploy `lambda_function.py`.
- **`502 Bad Gateway`** — the Lambda must return `statusCode`, `headers`, and a stringified `body`.
- **CORS errors in browser** — both the API CORS config and the Lambda's response headers must be present.

## Local Files

- `lambda_function.py` — the Lambda handler source (deployed to `JeffApiHandler`)
- `.aws-build/` — IAM policy JSON + resource IDs used during provisioning