import requests
import json
import sys

# Ensure UTF-8 output even if Windows console is CP1252
sys.stdout.reconfigure(encoding='utf-8')

def test():
    url = "https://www.datosabiertos.gob.pe/api/3/action/package_search"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    params = {"q": "convocatorias seace", "rows": 3}
    try:
        r = requests.get(url, headers=headers, params=params, timeout=15)
        print("Status Code:", r.status_code)
        if r.status_code == 200:
            data = r.json()
            results = data.get("result", {}).get("results", [])
            print("Found datasets:", len(results))
            for ds in results:
                print("Dataset Title:", ds.get("title"))
                print("Name:", ds.get("name"))
                resources = ds.get("resources", [])
                print("Resources count:", len(resources))
                for res in resources[:2]:
                    print("  Resource Name:", res.get("name"))
                    print("  Resource Format:", res.get("format"))
                    print("  Resource URL:", res.get("url"))
        else:
            print("Failed to get data. Status:", r.status_code)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test()
