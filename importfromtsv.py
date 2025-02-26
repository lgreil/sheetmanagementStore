import csv
import json
import requests

# Base URL for your API endpoints – adjust as needed.
BASE_URL = "http://localhost:3005"
PERSONS_URL = f"{BASE_URL}/personen"
STUECKE_URL = f"{BASE_URL}/stuecke"

# Caches to avoid redundant API calls.
person_cache = {}    # key: "vorname name" string, value: person id (pid)
stuecke_cache = {}   # key: stück name, value: stück id (stid)

# List to collect our API responses and payloads for output.
results = []

def parse_person_name(full_name):
    """
    Convert a full name to a dictionary with keys 'vorname' and 'name'.
    If the name contains a comma, it is assumed to be in "Last, First" format.
    Otherwise, it splits on whitespace.
    """
    if not full_name or not full_name.strip():
        return None
    full_name = full_name.strip()
    if ',' in full_name:
        parts = full_name.split(',')
        last = parts[0].strip()
        first = parts[1].strip() if len(parts) > 1 else ""
        return {"vorname": first, "name": last}
    else:
        parts = full_name.split()
        if len(parts) == 1:
            return {"vorname": "", "name": parts[0].strip()}
        first = parts[0].strip()
        last = " ".join(parts[1:]).strip()
        return {"vorname": first, "name": last}

def get_or_create_person(full_name):
    """
    Uses the persons API to get an existing person or create a new one.
    Caches the result to avoid duplicate requests.
    """
    parsed = parse_person_name(full_name)
    if not parsed:
        return None
    key = f"{parsed['vorname']} {parsed['name']}".strip()
    if key in person_cache:
        return person_cache[key]
    
    # Try to find the person by fetching all persons and filtering locally.
    try:
        response = requests.get(PERSONS_URL)
        if response.ok:
            data = response.json()
            # Look for an existing person with the matching name and vorname.
            match = next((p for p in data if p.get("name") == parsed["name"] and p.get("vorname") == parsed["vorname"]), None)
            if match:
                person_cache[key] = match["pid"]
                return match["pid"]
    except Exception as e:
        print(f"GET error for person '{full_name}': {e}")

    # If not found, create the person using POST.
    try:
        response = requests.post(PERSONS_URL, json=parsed)
        if response.ok:
            data = response.json()
            pid = data["pid"]
            person_cache[key] = pid
            return pid
        else:
            print(f"Error creating person '{full_name}': {response.text}")
    except Exception as e:
        print(f"POST error for person '{full_name}': {e}")
    return None

def get_all_stuecke():
    """
    Fetches all stücke from the API.
    """
    try:
        response = requests.get(STUECKE_URL)
        if response.ok:
            return response.json()
    except Exception as e:
        print(f"GET error for stücke: {e}")
    return []

def find_stueck_by_name(stueck_name, stuecke_list):
    """
    Searches a list of stücke for one with the given name.
    """
    return next((s for s in stuecke_list if s.get("name") == stueck_name), None)

def create_or_update_stueck(row):
    """
    Processes one TSV row:
      - Extracts stück details.
      - Resolves composer and arranger person IDs.
      - Uses the stücke API to create or update the record.
    """
    # TSV columns:
    # [0] Name, [1] Komponist / Künstler, [2] Arrangiert von, [3] Genre, [4] Sind Noten digital vorhanden?
    stueck_name = row[0].strip()
    composer_str = row[1].strip()  # May be empty.
    arranger_str = row[2].strip()  # May be empty.
    genre = row[3].strip()
    isdigitalisiert = row[4].strip().upper() == "TRUE"

    # Split names by semicolon if multiple names are present.
    composer_names = [s.strip() for s in composer_str.split(';') if s.strip()] if composer_str else []
    arranger_names = [s.strip() for s in arranger_str.split(';') if s.strip()] if arranger_str else []

    # Resolve person IDs for composers and arrangers.
    composer_ids = []
    for name in composer_names:
        pid = get_or_create_person(name)
        if pid:
            composer_ids.append(pid)
    arranger_ids = []
    for name in arranger_names:
        pid = get_or_create_person(name)
        if pid:
            arranger_ids.append(pid)

    # Build the payload for the stück.
    payload = {
        "name": stueck_name,
        "genre": genre,
        "isdigitalisiert": isdigitalisiert,
        "composerIds": composer_ids,
        "arrangerIds": arranger_ids
    }

    # Refresh the global stücke cache by fetching all stücke.
    all_stuecke = get_all_stuecke()
    existing_stueck = find_stueck_by_name(stueck_name, all_stuecke)
    
    if existing_stueck:
        stueck_id = existing_stueck["stid"]
        stuecke_cache[stueck_name] = stueck_id
        try:
            response = requests.put(f"{STUECKE_URL}/{stueck_id}", json=payload)
            if response.ok:
                print(f"Updated stück: '{stueck_name}'")
                results.append({"stueck": stueck_name, "action": "update", "payload": payload, "response": response.json()})
            else:
                print(f"Error updating stück '{stueck_name}': {response.text}")
                results.append({"stueck": stueck_name, "action": "update", "payload": payload, "error": response.text})
        except Exception as e:
            print(f"PUT exception for stück '{stueck_name}': {e}")
            results.append({"stueck": stueck_name, "action": "update", "payload": payload, "exception": str(e)})
    else:
        try:
            response = requests.post(STUECKE_URL, json=payload)
            if response.ok:
                data = response.json()
                stuecke_cache[stueck_name] = data["stid"]
                print(f"Created stück: '{stueck_name}'")
                results.append({"stueck": stueck_name, "action": "create", "payload": payload, "response": data})
            else:
                print(f"Error creating stück '{stueck_name}': {response.text}")
                results.append({"stueck": stueck_name, "action": "create", "payload": payload, "error": response.text})
        except Exception as e:
            print(f"POST exception for stück '{stueck_name}': {e}")
            results.append({"stueck": stueck_name, "action": "create", "payload": payload, "exception": str(e)})

def main():
    input_file = "input.tsv"
    try:
        with open(input_file, "r", encoding="utf-8") as f:
            reader = csv.reader(f, delimiter="\t")
            lines = list(reader)
    except Exception as e:
        print(f"Error reading {input_file}: {e}")
        return

    if not lines:
        print("No data found in the TSV file.")
        return

    # Remove header and process each row.
    header = lines.pop(0)
    for row in lines:
        if len(row) < 5:
            continue  # Skip rows with insufficient data.
        create_or_update_stueck(row)

    # Write the API responses and payloads to output.json for inspection.
    try:
        with open("output.json", "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print("API responses written to output.json")
    except Exception as e:
        print(f"Error writing output.json: {e}")

if __name__ == "__main__":
    main()
