import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env relative to this file
current_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(current_dir, '.env')
load_dotenv(dotenv_path)

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    print("Warning: SUPABASE_URL or SUPABASE_ANON_KEY not set in environment.")

# Initialize Supabase client
supabase: Client = create_client(supabase_url or "", supabase_key or "")
