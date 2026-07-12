import os
from dotenv import load_dotenv
from supabase import create_client, Client

current_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(current_dir, '.env')
load_dotenv(dotenv_path)

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_ANON_KEY")

supabase = None

if supabase_url and supabase_key:
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        print("Supabase client connected successfully.")
    except Exception as e:
        print(f"Error connecting to Supabase: {e}")
        supabase = None
else:
    print("Warning: SUPABASE_URL or SUPABASE_ANON_KEY not set. Running without database.")