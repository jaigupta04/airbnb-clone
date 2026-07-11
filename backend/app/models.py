from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    is_host = Column(Boolean, default=False)
    is_superhost = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    listings = relationship("Listing", back_populates="host", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="guest", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="author", cascade="all, delete-orphan")
    wishlist = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    icon = Column(String(50), nullable=True)
    listings = relationship("ListingCategory", back_populates="category", cascade="all, delete-orphan")


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    property_type = Column(String(50), nullable=False)
    room_type = Column(String(50), nullable=False)
    city = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    price_per_night = Column(Float, nullable=False)
    cleaning_fee = Column(Float, default=50.0)
    service_fee_pct = Column(Float, default=14.0)
    bedrooms = Column(Integer, default=1)
    beds = Column(Integer, default=1)
    baths = Column(Integer, default=1)
    max_guests = Column(Integer, default=2)
    amenities = Column(JSON, default=list)
    photos = Column(JSON, default=list)
    rating_avg = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    host = relationship("User", back_populates="listings")
    bookings = relationship("Booking", back_populates="listing", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="listing", cascade="all, delete-orphan")
    categories = relationship("ListingCategory", back_populates="listing", cascade="all, delete-orphan")
    wishlisted_by = relationship("Wishlist", back_populates="listing", cascade="all, delete-orphan")

    @property
    def category_list(self):
        return [lc.category for lc in self.categories]

    @property
    def is_wishlisted_prop(self):
        return False


class ListingCategory(Base):
    __tablename__ = "listing_categories"
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), primary_key=True)

    listing = relationship("Listing", back_populates="categories")
    category = relationship("Category", back_populates="listings")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    guest_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    check_in = Column(DateTime, nullable=False)
    check_out = Column(DateTime, nullable=False)
    guests = Column(Integer, default=1)
    nights = Column(Integer, nullable=False)
    nightly_total = Column(Float, nullable=False)
    cleaning_fee = Column(Float, default=0.0)
    service_fee = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    status = Column(String(20), default="confirmed")
    created_at = Column(DateTime, default=datetime.utcnow)

    listing = relationship("Listing", back_populates="bookings")
    guest = relationship("User", back_populates="bookings")
    review = relationship("Review", back_populates="booking", uselist=False, cascade="all, delete-orphan")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=True)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    listing = relationship("Listing", back_populates="reviews")
    author = relationship("User", back_populates="reviews")
    booking = relationship("Booking", back_populates="review")


class Wishlist(Base):
    __tablename__ = "wishlists"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (UniqueConstraint("user_id", "listing_id", name="uq_wishlist_user_listing"),)

    user = relationship("User", back_populates="wishlist")
    listing = relationship("Listing", back_populates="wishlisted_by")