from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/bookings", tags=["bookings"])


def compute_breakdown(listing: models.Listing, check_in: date, check_out: date) -> schemas.PriceBreakdown:
    nights = (check_out - check_in).days
    if nights <= 0:
        raise HTTPException(status_code=400, detail="Check-out must be after check-in")
    nightly_total = round(listing.price_per_night * nights, 2)
    cleaning_fee = round(listing.cleaning_fee, 2)
    service_fee = round(nightly_total * (listing.service_fee_pct / 100.0), 2)
    total = round(nightly_total + cleaning_fee + service_fee, 2)
    return schemas.PriceBreakdown(nights=nights, nightly_total=nightly_total, cleaning_fee=cleaning_fee, service_fee=service_fee, total=total)


def overlaps(a_in: date, a_out: date, b_in, b_out) -> bool:
    return a_in < b_out and a_out > b_in


@router.post("/price", response_model=schemas.PriceBreakdown)
def get_price(listing_id: int, check_in: date, check_out: date, db: Session = Depends(get_db)):
    l = db.query(models.Listing).filter(models.Listing.id == listing_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Listing not found")
    return compute_breakdown(l, check_in, check_out)


@router.post("", response_model=schemas.BookingOut, status_code=201)
def create_booking(payload: schemas.BookingCreate, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    l = db.query(models.Listing).filter(models.Listing.id == payload.listing_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Listing not found")
    if payload.guests > l.max_guests:
        raise HTTPException(status_code=400, detail=f"Exceeds max guests ({l.max_guests})")
    if payload.check_out <= payload.check_in:
        raise HTTPException(status_code=400, detail="Check-out must be after check-in")
    if payload.check_in < date.today():
        raise HTTPException(status_code=400, detail="Cannot book in the past")
    for b in l.bookings:
        if b.status in ("confirmed", "completed") and overlaps(payload.check_in, payload.check_out, b.check_in.date(), b.check_out.date()):
            raise HTTPException(status_code=409, detail="Those dates are already booked")
    if l.host_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot book your own listing")
    bd = compute_breakdown(l, payload.check_in, payload.check_out)
    booking = models.Booking(
        listing_id=l.id,
        guest_id=user.id,
        check_in=datetime.combine(payload.check_in, datetime.min.time()),
        check_out=datetime.combine(payload.check_out, datetime.min.time()),
        guests=payload.guests,
        nights=bd.nights,
        nightly_total=bd.nightly_total,
        cleaning_fee=bd.cleaning_fee,
        service_fee=bd.service_fee,
        total=bd.total,
        status="confirmed",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/my-trips", response_model=list[schemas.BookingWithListing])
def my_trips(db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    bookings = (
        db.query(models.Booking)
        .join(models.Listing)
        .filter(models.Booking.guest_id == user.id)
        .order_by(models.Booking.check_in.desc())
        .all()
    )
    out = []
    for b in bookings:
        d = schemas.BookingWithListing.model_validate(b)
        d.listing = schemas.ListingOut.model_validate(b.listing)
        out.append(d)
    return out


@router.get("/host", response_model=list[dict])
def host_bookings(db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    if not user.is_host:
        raise HTTPException(status_code=403, detail="Only hosts")
    bookings = (
        db.query(models.Booking)
        .join(models.Listing)
        .filter(models.Listing.host_id == user.id)
        .order_by(models.Booking.check_in.desc())
        .all()
    )
    return [
        {
            "id": b.id,
            "listing_id": b.listing_id,
            "listing_title": b.listing.title,
            "guest_name": b.guest.name,
            "guest_avatar": b.guest.avatar_url,
            "check_in": b.check_in.isoformat(),
            "check_out": b.check_out.isoformat(),
            "nights": b.nights,
            "total": b.total,
            "guests": b.guests,
            "status": b.status,
        }
        for b in bookings
    ]


@router.delete("/{booking_id}", status_code=204)
def cancel_booking(booking_id: int, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    b = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    if b.guest_id != user.id:
        raise HTTPException(status_code=403, detail="Not your booking")
    b.status = "cancelled"
    db.commit()


