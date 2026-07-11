from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("/listing/{listing_id}", response_model=list[schemas.ReviewOut])
def listing_reviews(listing_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(models.Review)
        .filter(models.Review.listing_id == listing_id)
        .order_by(models.Review.created_at.desc())
        .all()
    )
    out = []
    for r in reviews:
        d = schemas.ReviewOut.model_validate(r)
        d.author_name = r.author.name
        d.author_avatar = r.author.avatar_url
        out.append(d)
    return out


@router.post("", response_model=schemas.ReviewOut, status_code=201)
def create_review(payload: schemas.ReviewCreate, booking_id: int, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    b = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    if b.guest_id != user.id:
        raise HTTPException(status_code=403, detail="Cannot review someone else's booking")
    if b.review:
        raise HTTPException(status_code=400, detail="You already reviewed this booking")
    if datetime.now().date() < b.check_out.date():
        raise HTTPException(status_code=400, detail="Cannot review before stay ends")
    r = models.Review(
        listing_id=b.listing_id,
        author_id=user.id,
        booking_id=b.id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(r)
    db.flush()
    l = b.listing
    new_count = l.rating_count + 1
    new_avg = ((l.rating_avg * l.rating_count) + payload.rating) / new_count
    l.rating_avg = round(new_avg, 2)
    l.rating_count = new_count

    # superhost eligibility: host reviews >= 5 and avg >= 4.8
    host = l.host
    all_reviews = db.query(models.Review).join(models.Listing).filter(models.Listing.host_id == host.id).all()
    if len(all_reviews) >= 5:
        avg = sum(rv.rating for rv in all_reviews) / len(all_reviews)
        host.is_superhost = avg >= 4.8

    db.commit()
    db.refresh(r)
    out = schemas.ReviewOut.model_validate(r)
    out.author_name = r.author.name
    out.author_avatar = r.author.avatar_url
    return out


