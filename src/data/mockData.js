export const trendingCities = [
  {
    id: 1,
    name: 'Mumbai',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=800&q=80',
    localsCount: 0,
    rating: 4.9,
    topPlaces: ['Gateway of India', 'Marine Drive', 'Colaba Causeway']
  },
  {
    id: 2,
    name: 'Jaipur',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
    localsCount: 0,
    rating: 4.8,
    topPlaces: ['Hawa Mahal', 'Amer Fort', 'City Palace']
  },
  {
    id: 3,
    name: 'Surat',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    localsCount: 0,
    rating: 4.7,
    topPlaces: ['Dumas Beach', 'Dutch Garden', 'Surat Castle']
  },
  {
    id: 4,
    name: 'Nashik',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
    localsCount: 0,
    rating: 4.6,
    topPlaces: ['Sula Vineyards', 'Panchavati', 'Trimbakeshwar Temple']
  },
  {
    id: 5,
    name: 'Vadodara',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=800&q=80',
    localsCount: 0,
    rating: 4.8,
    topPlaces: ['Laxmi Vilas Palace', 'Sayaji Baug', 'Champaner-Pavagadh']
  },
  {
    id: 6,
    name: 'Bangalore',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
    localsCount: 0,
    rating: 4.8,
    topPlaces: ['Lalbagh Botanical Garden', 'Bangalore Palace', 'Cubbon Park']
  },
  {
    id: 7,
    name: 'New Delhi',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
    localsCount: 0,
    rating: 4.9,
    topPlaces: ['Red Fort', 'Qutub Minar', 'India Gate']
  },
  {
    id: 8,
    name: 'Chennai',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    localsCount: 0,
    rating: 4.7,
    topPlaces: ['Marina Beach', 'Kapaleeshwarar Temple', 'Fort St. George']
  },
  {
    id: 9,
    name: 'Hyderabad',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?auto=format&fit=crop&w=800&q=80',
    localsCount: 0,
    rating: 4.8,
    topPlaces: ['Charminar', 'Golconda Fort', 'Ramoji Film City']
  },
  {
    id: 10,
    name: 'Kolkata',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80',
    localsCount: 0,
    rating: 4.7,
    topPlaces: ['Victoria Memorial', 'Howrah Bridge', 'Dakshineswar Kali Temple']
  }
];

export const locals = [
  {
    id: 1,
    name: 'Yuki Tanaka',
    location: 'Tokyo, Japan',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
    interests: ['Foodie', 'Photography', 'Nightlife'],
    rating: 5.0,
    reviews: 48,
    languages: ['Japanese', 'English'],
    bio: 'Born and raised in Shinjuku, I know the best hidden sushi spots and secret rooftop bars that you won\'t find in any guidebook.',
    availability: 'Weekends & Evenings',
    price: '$25/hr'
  },
  {
    id: 2,
    name: 'Marco Rossi',
    location: 'Rome, Italy',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    interests: ['History', 'Art', 'Architecture'],
    rating: 4.9,
    reviews: 32,
    languages: ['Italian', 'English', 'Spanish'],
    bio: 'As a history graduate, I love sharing the stories behind Rome\'s ancient ruins and Renaissance masterpieces.',
    availability: 'Full-time',
    price: '$30/hr'
  },
  {
    id: 3,
    name: 'Sarah Jenkins',
    location: 'London, UK',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    interests: ['Shopping', 'Fashion', 'Cafes'],
    rating: 4.8,
    reviews: 56,
    languages: ['English', 'French'],
    bio: 'I can take you to the most stylish boutiques and the cutest afternoon tea spots in West London.',
    availability: 'Weekdays',
    price: '$20/hr'
  }
];

export const testimonials = [
  {
    id: 1,
    text: "LocalConnect made my trip to Tokyo unforgettable. Yuki showed us parts of the city we would never have seen alone!",
    author: "Alex Johnson",
    role: "Traveler"
  },
  {
    id: 2,
    text: "The best way to experience a city. No tourist traps, just real local experiences.",
    author: "Elena Martinez",
    role: "Digital Nomad"
  }
];

export const messages = [
  {
    id: 1,
    senderId: 1, // Yuki
    text: "Hi Alex! Super excited to show you around Shinjuku tomorrow. Does 6 PM work?",
    timestamp: "10:30 AM"
  },
  {
    id: 2,
    senderId: 'me',
    text: "Yes, 6 PM is perfect! Should we meet at the station?",
    timestamp: "10:35 AM"
  },
  {
    id: 3,
    senderId: 1,
    text: "Actually, meet me at the East Exit near the cat billboard. It's easier to find!",
    timestamp: "10:38 AM"
  }
];
