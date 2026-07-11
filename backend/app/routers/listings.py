from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from datetime import datetime, date
from typing import Optional
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/listings", tags=["listings"])


def serialize_listing(l: models.Listing, user: Optional[models.User] = None) -> schemas.ListingOut:
    out = schemas.ListingOut.model_validate(l)
    out.categories = [schemas.CategoryOut.model_validate(c.category) for c in l.categories]
    if user:
        out.is_wishlisted = any(w.user_id == user.id for w in l.wishlisted_by)
    return out


def blocked_dates(l: models.Listing) -> set:
    blocked = set()
    for b in l.bookings:
        if b.status in ("confirmed", "completed"):
            cur = b.check_in.date()
            end = b.check_out.date()
            while cur < end:
                blocked.add(cur.isoformat())
                from datetime import timedelta as _td
                cur = cur + _td(days=1)
    return blocked


@router.get("", response_model=list[schemas.ListingOut])
def list_listings(
    city: Optional[str] = None,
    category_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    property_type: Optional[str] = None,
    room_type: Optional[str] = None,
    guests: Optional[int] = None,
    check_in: Optional[date] = None,
    check_out: Optional[date] = None,
    amenities: Optional[str] = None,
    sort: Optional[str] = None,
    limit: int = Query(12, le=100),
    offset: int = 0,
    db: Session = Depends(get_db),
    user: Optional[models.User] = Depends(auth.get_optional_user),
):
    q = db.query(models.Listing)
    if city:
        q = q.filter(models.Listing.city.ilike(f"%{city}%"))
    if category_id:
        q = q.join(models.ListingCategory).filter(models.ListingCategory.category_id == category_id)
    if min_price is not None:
        q = q.filter(models.Listing.price_per_night >= min_price)
    if max_price is not None:
        q = q.filter(models.Listing.price_per_night <= max_price)
    if property_type:
        q = q.filter(models.Listing.property_type == property_type)
    if room_type:
        q = q.filter(models.Listing.room_type == room_type)
    if guests:
        q = q.filter(models.Listing.max_guests >= guests)
    if amenities:
        for a in amenities.split(","):
            q = q.filter(models.Listing.amenities.like(f'%"{a.strip()}"%'))
    if check_in and check_out:
        overlapping = (
            db.query(models.Booking.listing_id)
            .filter(models.Booking.status.in_(("confirmed", "completed")))
            .filter(models.Booking.check_in < check_out, models.Booking.check_out > check_in)
            .distinct()
            .subquery()
        )
        q = q.filter(~models.Listing.id.in_(overlapping))

    if sort == "price_asc":
        q = q.order_by(models.Listing.price_per_night.asc())
    elif sort == "price_desc":
        q = q.order_by(models.Listing.price_per_night.desc())
    elif sort == "rating":
        q = q.order_by(models.Listing.rating_avg.desc())
    else:
        q = q.order_by(models.Listing.created_at.desc())

    listings = q.options(joinedload(models.Listing.host)).offset(offset).limit(limit).all()
    return [serialize_listing(l, user) for l in listings]


@router.get("/{listing_id}", response_model=schemas.ListingOut)
def get_listing(listing_id: int, db: Session = Depends(get_db), user: Optional[models.User] = Depends(auth.get_optional_user)):
    l = db.query(models.Listing).options(joinedload(models.Listing.host)).filter(models.Listing.id == listing_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Listing not found")
    return serialize_listing(l, user)


@router.post("", response_model=schemas.ListingOut, status_code=201)
def create_listing(payload: schemas.ListingCreate, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    if not user.is_host:
        raise HTTPException(status_code=403, detail="Only hosts can create listings")
    l = models.Listing(
        host_id=user.id,
        title=payload.title,
        description=payload.description,
        property_type=payload.property_type,
        room_type=payload.room_type,
        city=payload.city,
        country=payload.country,
        lat=payload.lat,
        lng=payload.lng,
        price_per_night=payload.price_per_night,
        cleaning_fee=payload.cleaning_fee,
        bedrooms=payload.bedrooms,
        beds=payload.beds,
        baths=payload.baths,
        max_guests=payload.max_guests,
        amenities=payload.amenities,
        photos=payload.photos,
    )
    db.add(l)
    db.flush()
    for cid in payload.category_ids:
        db.add(models.ListingCategory(listing_id=l.id, category_id=cid))
    db.commit()
    db.refresh(l)
    return serialize_listing(l, user)


@router.put("/{listing_id}", response_model=schemas.ListingOut)
def update_listing(listing_id: int, payload: schemas.ListingUpdate, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    l = db.query(models.Listing).filter(models.Listing.id == listing_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Listing not found")
    if l.host_id != user.id:
        raise HTTPException(status_code=403, detail="Not your listing")
    data = payload.model_dump(exclude_unset=True)
    cat_ids = data.pop("category_ids", None)
    for k, v in data.items():
        setattr(l, k, v)
    if cat_ids is not None:
        db.query(models.ListingCategory).filter(models.ListingCategory.listing_id == l.id).delete()
        for cid in cat_ids:
            db.add(models.ListingCategory(listing_id=l.id, category_id=cid))
    db.commit()
    db.refresh(l)
    return serialize_listing(l, user)


@router.delete("/{listing_id}", status_code=204)
def delete_listing(listing_id: int, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    l = db.query(models.Listing).filter(models.Listing.id == listing_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Listing not found")
    if l.host_id != user.id:
        raise HTTPException(status_code=403, detail="Not your listing")
    db.delete(l)
    db.commit()


@router.get("/host/my", response_model=list[schemas.ListingOut])
def my_listings(db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    listings = db.query(models.Listing).options(joinedload(models.Listing.host)).filter(models.Listing.host_id == user.id).all()
    return [serialize_listing(l, user) for l in listings]


@router.get("/{listing_id}/availability", response_model=schemas.AvailabilityOut)
def get_availability(listing_id: int, db: Session = Depends(get_db)):
    l = db.query(models.Listing).filter(models.Listing.id == listing_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Listing not found")
    return schemas.AvailabilityOut(unavailable=sorted(list(blocked_dates(l))))