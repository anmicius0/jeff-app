import json
import os
from decimal import Decimal

import boto3
from boto3.dynamodb.conditions import Key

TABLE_NAME = os.environ.get("TABLE_NAME", "JeffLogs")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token",
}


def _serialize(obj):
    if isinstance(obj, Decimal):
        return int(obj) if obj == obj.to_integral() else float(obj)
    raise TypeError(f"Object of type {type(obj).__name__} is not JSON serializable")


def _respond(status_code, body):
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body, default=_serialize),
    }


def _normalize_name(name):
    if not name:
        return ""
    clean = "".join(c.lower() for c in name if c.isalnum())
    if ("meadows" in clean or "inclinelying" in clean) and "lateral" in clean:
        return "meadowsinclinedblateralraise"
    if "neutralgrip" in clean and "pull" in clean:
        return "neutralgrippullup"
    if "pendlay" in clean and "row" in clean:
        return "deficitpendlayrow"
    if "stretch" in clean and "curl" in clean:
        return "inclinedbstretchcurl"
    if "goodmorning" in clean:
        return "goodmorninglightweight"
    if "nordic" in clean:
        return "nordichamcurl"
    return clean


def lambda_handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method")
    if not method:
        method = event.get("httpMethod")

    if method == "OPTIONS":
        return _respond(200, {"message": "OK"})

    try:
        if method == "POST":
            return create_workout(event)
        if method == "GET":
            return list_workouts(event)
        if method == "DELETE":
            return delete_workout(event)
        return _respond(404, {"message": f"Unsupported method: {method}"})
    except Exception as exc:
        print(f"ERROR: {exc}")
        return _respond(500, {"message": str(exc)})


def create_workout(event):
    body = json.loads(event.get("body") or "{}")
    date = body.get("Date") or body.get("date")
    name = body.get("WorkoutName") or body.get("workoutName")
    set_no = body.get("Set") or body.get("set")

    if not date or not name or set_no is None:
        return _respond(400, {"message": "Date, WorkoutName, and Set are required"})

    item = {
        "Date": date,
        "WorkoutName#Set": f"{name}#{set_no}",
        "WorkoutName": name,
        "Set": int(set_no),
    }
    for key, value in body.items():
        if key not in ("Date", "WorkoutName", "Set", "date", "workoutName", "set"):
            item[key] = value

    table.put_item(Item=item)
    return _respond(201, {"message": "Workout saved", "item": item})


def list_workouts(event):
    params = event.get("queryStringParameters") or {}
    date = params.get("Date") or params.get("date")

    if date:
        response = table.query(KeyConditionExpression=Key("Date").eq(date))
    else:
        response = table.scan()

    items = response.get("Items", [])
    return _respond(200, {"workouts": items})


def delete_workout(event):
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            body = {}
    params = event.get("queryStringParameters") or {}

    date = body.get("Date") or body.get("date") or params.get("Date") or params.get("date")
    name = body.get("WorkoutName") or body.get("workoutName") or params.get("WorkoutName") or params.get("workoutName")
    set_no = body.get("Set") or body.get("set") or params.get("Set") or params.get("set")
    sk = body.get("WorkoutName#Set") or params.get("WorkoutName#Set")

    if not date:
        return _respond(400, {"message": "Date is required to delete records"})

    response = table.query(KeyConditionExpression=Key("Date").eq(date))
    items = response.get("Items", [])

    if not items:
        return _respond(200, {"message": f"No items found for date {date}", "deletedCount": 0})

    deleted_count = 0
    norm_target = _normalize_name(name) if name else None
    target_set = int(set_no) if set_no is not None else None

    for item in items:
        item_sk = item.get("WorkoutName#Set", "")
        item_name = item.get("WorkoutName") or item_sk.split("#")[0]
        item_norm = _normalize_name(item_name)
        
        try:
            item_set = int(item.get("Set") or (item_sk.split("#")[1] if "#" in item_sk else 0))
        except (ValueError, IndexError):
            item_set = 0

        should_delete = False

        # Direct sort key match
        if sk and item_sk == sk:
            should_delete = True
        # Specific set match (name + set number)
        elif norm_target and target_set is not None:
            if (norm_target == item_norm or name == item_name) and item_set == target_set:
                should_delete = True
        # Exercise match (all sets for this exercise)
        elif norm_target:
            if norm_target == item_norm or name == item_name:
                should_delete = True
        # Entire session match (all items for this date)
        elif not name and set_no is None and not sk:
            should_delete = True

        if should_delete:
            table.delete_item(Key={"Date": date, "WorkoutName#Set": item_sk})
            deleted_count += 1

    return _respond(200, {
        "message": f"Deleted {deleted_count} items for date {date}",
        "deletedCount": deleted_count
    })
