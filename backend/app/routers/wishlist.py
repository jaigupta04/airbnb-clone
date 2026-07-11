from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


@router.get("", response_model=list[schemas.ListingOut])
def my_wishlist(db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    items = (
        db.query(models.Wishlist)
        .options(joinedload(models.Wishlist.listing).joinedload(models.Listing.host))
        .filter(models.Wishlist.user_id == user.id)
        .all()
    )
    out = []
    for w in items:
        l = w.listing
        d = schemas.ListingOut.model_validate(l)
        d.is_wishlisted = True
        out.append(d)
    return out


@router.post("/{listing_id}", status_code=201)
def add_wishlist(listing_id: int, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    l = db.query(models.Listing).filter(models.Listing.id == listing_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Listing not found")
    existing = db.query(models.Wishlist).filter(models.Wishlist.user_id == user.id, models.Wishlist.listing_id == listing_id).first()
    if existing:
        return {"ok": True}
    db.add(models.Wishlist(user_id=user.id, listing_id=listing_id))
    db.commit()
    return {"ok": True}


@router.delete("/{listing_id}", status_code=204)
def remove_wishlist(listing_id: int, db: Session = Depends(get_db), user: models.User = Depends(auth.get_current_user)):
    item = db.query(models.Wishlist).filter(models.Wishlist.user_id == user.id, models.Wishlist.listing_id == listing_id).first()
    if item:
        db.delete(item)
        db.commit()