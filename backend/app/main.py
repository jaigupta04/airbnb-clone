from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import engine, Base, SessionLocal
from app import models, seed as seed_module
from app.routers import auth, listings, bookings, reviews, wishlist, categories


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_module.seed(db)
    finally:
        db.close()
    yield


app = FastAPI(title="Airbnb Clone API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "service": "airbnb-clone-api"}


app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(reviews.router)
app.include_router(wishlist.router)
app.include_router(categories.router)