from datetime import datetime, timedelta, date
from app import models, auth

CATS = [
    ("Amazing views", "mount"),
    ("Beachfront", "beach"),
    ("Cabins", "cabin"),
    ("Countryside", "farm"),
    ("Design", "design"),
    ("Iconic cities", "city"),
    ("Mansions", "mansion"),
    ("OMG!", "omg"),
    ("Tiny homes", "tiny"),
    ("Treehouses", "tree"),
    ("Arctic", "snow"),
    ("Tropical", "tropical"),
    ("Lakefront", "lake"),
    ("Castles", "castle"),
    ("Boats", "boat"),
]

PHOTO_POOL = [
    "https://images.unsplash.com/photo-1564013799959-ab0169600b54?w=1200",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
    "https://images.unsplash.com/photo-1512917774083-464c07219638?w=1200",
    "https://images.unsplash.com/photo-1580587771575-6f4f1c3d9e6c?w=1200",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0ff4?w=1200",
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068d8c5?w=1200",
    "https://images.unsplash.com/photo-1484154214240-1e3ed3add8e2?w=1200",
    "https://images.unsplash.com/photo-1613977414470-1b4f3a6ef47a?w=1200",
    "https://images.unsplash.com/photo-1570213489059-0aac6626cade?w=1200",
    "https://images.unsplash.com/photo-1517825736776-754a4f5d4d66?w=1200",
    "https://images.unsplash.com/photo-1618134786907-1c6a4c5f4e2a?w=1200",
    "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200",
    "https://images.unsplash.com/photo-1484154214240-1e3ed3add8e2?w=1200",
    "https://images.unsplash.com/photo-1595526114038-0d457344f041?w=1200",
    "https://images.unsplash.com/photo-1560448204-e02ea11c3aef?w=1200",
    "https://images.unsplash.com/photo-1517825736776-754a4f5d4d66?w=1200",
    "https://images.unsplash.com/photo-1540541338707-1f50f29edb4d?w=1200",
    "https://images.unsplash.com/photo-1522444195799-478538b9c5cb?w=1200",
]

AMENITY_POOL = [
    "Wifi", "Kitchen", "Free parking", "Pool", "Hot tub", "Air conditioning",
    "Washer", "Dryer", "TV", "Fireplace", "Gym", "Breakfast", " workspace",
    "Beach access", "Mountain view", "Garden", "Patio", " BBQ grill", "Heating", "Ev charger",
]

LISTINGS = [
    {
        "title": "Cliffside Villa with Infinity Pool",
        "description": "Perched on a dramatic cliff overlooking the blue Aegean, this villa offers breathtaking sunsets, a private infinity pool, and luxurious indoor-outdoor living. Perfect for a romantic escape or an unforgettable family holiday.",
        "property_type": "Villa", "room_type": "Entire place",
        "city": "Santorini", "country": "Greece", "lat": 36.39, "lng": 25.46,
        "price_per_night": 420, "cleaning_fee": 120, "bedrooms": 3, "beds": 4, "baths": 3, "max_guests": 6,
        "categories": ["Amazing views", "Beachfront"],
    },
    {
        "title": "Modern Loft in SoHo",
        "description": "A stylish designer loft in the heart of SoHo with high ceilings, exposed brick, and floor-to-ceiling windows. Steps from the best galleries, cafes, and shopping in Manhattan.",
        "property_type": "Loft", "room_type": "Entire place",
        "city": "New York", "country": "United States", "lat": 40.72, "lng": -74.00,
        "price_per_night": 285, "cleaning_fee": 75, "bedrooms": 1, "beds": 2, "baths": 1, "max_guests": 3,
        "categories": ["Iconic cities", "Design"],
    },
    {
        "title": "Cozy Alpine Chalet",
        "description": "Nestled in the Swiss Alps, this wooden chalet features a roaring fireplace, a sauna, and ski-in/ski-out access. Wake up to snowy peaks and hot chocolate every morning.",
        "property_type": "Chalet", "room_type": "Entire place",
        "city": "Zermatt", "country": "Switzerland", "lat": 46.02, "lng": 7.74,
        "price_per_night": 360, "cleaning_fee": 100, "bedrooms": 4, "beds": 6, "baths": 3, "max_guests": 8,
        "categories": ["Cabins", "Amazing views"],
    },
    {
        "title": "Beachfront Bungalow",
        "description": "Wake up to the sound of waves in this overwater-style bungalow on a private stretch of white sand. Includes a private deck, kayak, and snorkeling gear.",
        "property_type": "Bungalow", "room_type": "Entire place",
        "city": "Maldives", "country": "Maldives", "lat": 3.20, "lng": 73.22,
        "price_per_night": 510, "cleaning_fee": 90, "bedrooms": 1, "beds": 1, "baths": 1, "max_guests": 2,
        "categories": ["Beachfront", "Tropical"],
    },
    {
        "title": "Treehouse in the Redwoods",
        "description": "A magical treehouse suspended among ancient redwoods. Features a cozy bed, a composting toilet, and a wraparound deck for stargazing. Off-grid but wifi-equipped.",
        "property_type": "Treehouse", "room_type": "Entire place",
        "city": "Big Sur", "country": "United States", "lat": 36.27, "lng": -121.80,
        "price_per_night": 195, "cleaning_fee": 40, "bedrooms": 1, "beds": 1, "baths": 1, "max_guests": 2,
        "categories": ["Treehouses", "Tiny homes", "OMG!"],
    },
    {
        "title": "Tiny Home on a Cliff Edge",
        "description": "An award-winning tiny home perched on a cliff overlooking the ocean. Sustainable, solar-powered, and packed with clever design. Sleep under the stars through the skylight.",
        "property_type": "Tiny home", "room_type": "Entire place",
        "city": "Ecuador", "country": "Ecuador", "lat": -0.18, "lng": -78.47,
        "price_per_night": 145, "cleaning_fee": 30, "bedrooms": 1, "beds": 1, "baths": 1, "max_guests": 2,
        "categories": ["Tiny homes", "Amazing views", "OMG!"],
    },
    {
        "title": "Countryside Farmhouse",
        "description": "A restored 18th-century farmhouse surrounded by vineyards and olive groves. Slow living at its finest, with a wood-burning oven, garden produce, and friendly donkeys.",
        "property_type": "Farm stay", "room_type": "Entire place",
        "city": "Tuscany", "country": "Italy", "lat": 43.40, "lng": 11.80,
        "price_per_night": 230, "cleaning_fee": 60, "bedrooms": 5, "beds": 8, "baths": 4, "max_guests": 10,
        "categories": ["Countryside", "Design"],
    },
    {
        "title": "Arctic Glass Igloo",
        "description": "Gaze at the Northern Lights from the cozy comfort of a heated glass igloo. Includes a double bed, fireplace lounge, and morning reindeer sightings.",
        "property_type": "Igloo", "room_type": "Entire place",
        "city": "Tromso", "country": "Norway", "lat": 69.65, "lng": 18.95,
        "price_per_night": 305, "cleaning_fee": 55, "bedrooms": 1, "beds": 1, "baths": 1, "max_guests": 2,
        "categories": ["Arctic", "Amazing views", "OMG!"],
    },
    {
        "title": "Tropical Tower in Bali",
        "description": "This bamboo tower house rises above the jungle canopy. Infinity plunge pool, yoga deck, and a chef on request. Total privacy surrounded by rice terraces.",
        "property_type": "Boutique hotel room", "room_type": "Entire place",
        "city": "Ubud", "country": "Indonesia", "lat": -8.50, "lng": 115.26,
        "price_per_night": 198, "cleaning_fee": 45, "bedrooms": 2, "beds": 3, "baths": 2, "max_guests": 4,
        "categories": ["Tropical", "Design"],
    },
    {
        "title": "Lakefront Log Cabin",
        "description": "A classic log cabin right on the shore of a crystal-clear lake. Canoe included. Private dock, fire pit, and stunning fall foliage right outside your window.",
        "property_type": "Cabin", "room_type": "Entire place",
        "city": "Big Bear Lake", "country": "United States", "lat": 34.24, "lng": -116.89,
        "price_per_night": 175, "cleaning_fee": 50, "bedrooms": 2, "beds": 3, "baths": 1, "max_guests": 5,
        "categories": ["Lakefront", "Cabins"],
    },
    {
        "title": "Converted Castle Suite",
        "description": "Sleep like royalty in a genuine 12th-century castle wing. Gothic arches, tapestries, and a claw-foot tub. Modern comforts hidden behind medieval charm.",
        "property_type": "Castle", "room_type": "Entire place",
        "city": "Edinburgh", "country": "United Kingdom", "lat": 55.95, "lng": -3.18,
        "price_per_night": 485, "cleaning_fee": 110, "bedrooms": 4, "beds": 5, "baths": 4, "max_guests": 8,
        "categories": ["Castles", "OMG!"],
    },
    {
        "title": "Heritage Houseboat",
        "description": "A lovingly restored Victorian houseboat moored on a peaceful canal. Wake to swans at your window and coffee on the deck. Cosy wood interior with modern kitchen.",
        "property_type": "Boat", "room_type": "Entire place",
        "city": "Amsterdam", "country": "Netherlands", "lat": 52.37, "lng": 4.90,
        "price_per_night": 265, "cleaning_fee": 65, "bedrooms": 2, "beds": 3, "baths": 1, "max_guests": 4,
        "categories": ["Boats", "Iconic cities"],
    },
]

REVIEWS = [
    ("Absolutely magical stay. The view is even better than the photos!", 5),
    ("Spotlessly clean and the host was incredibly responsive.", 5),
    ("A dream come true - we didn't want to leave.", 5),
    ("Beautiful property, minor issues with hot water but quickly fixed.", 4),
    ("Perfect location and very peaceful. Would book again.", 5),
    ("Unique experience, exactly as described. Highly recommend!", 5),
    ("Charming but a bit cramped for our group of 4.", 4),
    (" Stunning sunsets every single night.", 5),
    ("Host went above and beyond with local recommendations.", 5),
    ("Worth every penny. The photos don't do it justice.", 5),
]


def _pick_photos(seed: int, n: int = 5):
    out = []
    for i in range(n):
        out.append(PHOTO_POOL[(seed * 3 + i) % len(PHOTO_POOL)])
    return out


def _pick_amenities(seed: int):
    import random
    rng = random.Random(seed * 17 + 3)
    k = rng.randint(6, 10)
    return rng.sample(AMENITY_POOL, k)


def seed(db):
    if db.query(models.User).count() > 0:
        return

    # Users
    hosts = [
        {"name": "Maria Rossi", "email": "maria@example.com", "is_host": True},
        {"name": "James Carter", "email": "james@example.com", "is_host": True},
        {"name": "Aiko Tanaka", "email": "aiko@example.com", "is_host": True},
    ]
    guests = [
        {"name": "Priya Sharma", "email": "priya@example.com", "is_host": False},
        {"name": "Liam O'Brien", "email": "liam@example.com", "is_host": False},
        {"name": "Fatima Hassan", "email": "fatima@example.com", "is_host": True},
    ]

    user_objs = []
    for u in hosts + guests:
        pwd = auth.hash_password("password123")
        usr = models.User(
            name=u["name"],
            email=u["email"],
            password_hash=pwd,
            avatar_url=f"https://api.dicebear.com/7.x/initials/svg?seed={u['name'].replace(' ', '%20')}&backgroundColor=b6e3f4,c0aede,d1d4f9",
            is_host=u["is_host"],
            is_superhost=u["name"] == "Maria Rossi",
        )
        db.add(usr)
        user_objs.append(usr)
    db.flush()

    # Categories
    cat_map = {}
    for name, icon in CATS:
        c = models.Category(name=name, icon=icon)
        db.add(c)
        cat_map[name] = c
    db.flush()

    # Listings
    listing_objs = []
    for i, linfo in enumerate(LISTINGS):
        host = user_objs[i % len(hosts)]
        pics = _pick_photos(i + 1)
        amenities = _pick_amenities(i + 1)
        l = models.Listing(
            host_id=host.id,
            title=linfo["title"],
            description=linfo["description"],
            property_type=linfo["property_type"],
            room_type=linfo["room_type"],
            city=linfo["city"],
            country=linfo["country"],
            lat=linfo["lat"],
            lng=linfo["lng"],
            price_per_night=linfo["price_per_night"],
            cleaning_fee=linfo["cleaning_fee"],
            bedrooms=linfo["bedrooms"],
            beds=linfo["beds"],
            baths=linfo["baths"],
            max_guests=linfo["max_guests"],
            amenities=amenities,
            photos=pics,
            rating_avg=4.7,
            rating_count=3,
        )
        db.add(l)
        db.flush()
        listing_objs.append(l)
        for cn in linfo["categories"]:
            db.add(models.ListingCategory(listing_id=l.id, category_id=cat_map[cn].id))
    db.flush()

    # Bookings + Reviews for variety
    import random
    rng = random.Random(42)
    today = date.today()
    for idx, (guest) in enumerate([user_objs[3], user_objs[4], user_objs[5], user_objs[3], user_objs[4]]):
        l = listing_objs[idx]
        start = today + timedelta(days=idx * 7 + 10)
        end = start + timedelta(days=rng.randint(2, 5))
        b = models.Booking(
            listing_id=l.id, guest_id=guest.id,
            check_in=datetime.combine(start, datetime.min.time()),
            check_out=datetime.combine(end, datetime.min.time()),
            guests=rng.randint(1, l.max_guests), nights=(end - start).days,
            nightly_total=round(l.price_per_night * (end - start).days, 2),
            cleaning_fee=l.cleaning_fee, service_fee=round(l.price_per_night * (end - start).days * 0.14, 2),
            total=round(l.price_per_night * (end - start).days + l.cleaning_fee + l.price_per_night * (end - start).days * 0.14, 2),
            status="confirmed",
        )
        db.add(b)
    db.flush()

    # Past completed bookings with reviews for the first 3 listings
    for i in range(3):
        l = listing_objs[i]
        for g in [user_objs[3], user_objs[4]]:
            start = today - timedelta(days=(i + 1) * 30)
            end = start + timedelta(days=4)
            b = models.Booking(
                listing_id=l.id, guest_id=g.id,
                check_in=datetime.combine(start, datetime.min.time()),
                check_out=datetime.combine(end, datetime.min.time()),
                guests=2, nights=4,
                nightly_total=round(l.price_per_night * 4, 2),
                cleaning_fee=l.cleaning_fee, service_fee=round(l.price_per_night * 4 * 0.14, 2),
                total=round(l.price_per_night * 4 + l.cleaning_fee + l.price_per_night * 4 * 0.14, 2),
                status="completed",
            )
            db.add(b)
            db.flush()
            rv = random.choice(REVIEWS)
            r = models.Review(
                listing_id=l.id, author_id=g.id, booking_id=b.id,
                rating=rv[1], comment=rv[0],
            )
            db.add(r)

    db.commit()
    print("Seeded database with users, listings, bookings and reviews.")