import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env
load_dotenv()

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    print("Warning: SUPABASE_URL or SUPABASE_ANON_KEY not set in environment.")

# Initialize Supabase client
supabase: Client = create_client(supabase_url or "", supabase_key or "")
