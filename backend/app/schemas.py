from datetime import datetime, date
from typing import List, Optional, Any
from pydantic import BaseModel, Field, ConfigDict, EmailStr


class UserBase(BaseModel):
    name: str
    email: EmailStr
    avatar_url: Optional[str] = None
    is_host: bool = False


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(UserBase):
    id: int
    is_superhost: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ---- Categories ----
class CategoryOut(BaseModel):
    id: int
    name: str
    icon: Optional[str]
    model_config = ConfigDict(from_attributes=True)


# ---- Listings ----
class ListingBase(BaseModel):
    title: str
    description: str
    property_type: str
    room_type: str
    city: str
    country: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    price_per_night: float
    cleaning_fee: float = 50.0
    bedrooms: int = 1
    beds: int = 1
    baths: int = 1
    max_guests: int = 2
    amenities: List[str] = []
    photos: List[str] = []
    category_ids: List[int] = []


class ListingCreate(ListingBase):
    pass


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[str] = None
    room_type: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    price_per_night: Optional[float] = None
    cleaning_fee: Optional[float] = None
    bedrooms: Optional[int] = None
    beds: Optional[int] = None
    baths: Optional[int] = None
    max_guests: Optional[int] = None
    amenities: Optional[List[str]] = None
    photos: Optional[List[str]] = None
    category_ids: Optional[List[int]] = None


class HostOut(BaseModel):
    id: int
    name: str
    avatar_url: Optional[str]
    is_superhost: bool
    model_config = ConfigDict(from_attributes=True)


class ListingOut(BaseModel):
    id: int
    title: str
    description: str
    property_type: str
    room_type: str
    city: str
    country: str
    lat: Optional[float]
    lng: Optional[float]
    price_per_night: float
    cleaning_fee: float
    bedrooms: int
    beds: int
    baths: int
    max_guests: int
    amenities: List[Any]
    photos: List[Any]
    rating_avg: float
    rating_count: int
    host: HostOut
    categories: List[CategoryOut] = Field(default_factory=list, validation_alias="category_list")
    is_wishlisted: bool = Field(default=False, validation_alias="is_wishlisted_prop")
    created_at: datetime
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


# ---- Bookings ----
class BookingCreate(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    guests: int = 1


class BookingOut(BaseModel):
    id: int
    listing_id: int
    guest_id: int
    check_in: datetime
    check_out: datetime
    guests: int
    nights: int
    nightly_total: float
    cleaning_fee: float
    service_fee: float
    total: float
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class BookingWithListing(BookingOut):
    listing: ListingOut


class AvailabilityOut(BaseModel):
    unavailable: List[str] = []  # ISO date strings


# ---- Reviews ----
class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str


class ReviewOut(BaseModel):
    id: int
    listing_id: int
    author_id: int
    author_name: Optional[str] = None
    author_avatar: Optional[str] = None
    booking_id: Optional[int]
    rating: int
    comment: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ---- Token ----
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---- Price breakdown ----
class PriceBreakdown(BaseModel):
    nights: int
    nightly_total: float
    cleaning_fee: float
    service_fee: float
    total: float