import uvicorn
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))
port = int(os.environ.get("PORT", 8000))
uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)