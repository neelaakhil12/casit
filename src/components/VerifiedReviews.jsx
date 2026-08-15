import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../admin/lib/supabase';
import { 
  Star, 
  ShieldCheck, 
  X, 
  Heart, 
  Eye, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Video as VideoIcon,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

// Default Verified Customer Wall Photos
export const defaultVerifiedReviews = [
  {
    id: 1,
    image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop',
    customer_name: 'Ananya S.',
    location: 'Mumbai',
    caption: 'Completely transformed my bedroom wall! The 300 GSM matte paper quality is unmatched.',
    rating: 5
  },
  {
    id: 2,
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
    customer_name: 'Rohan V.',
    location: 'Bengaluru',
    caption: 'My gaming desk looks like a streamer battlestation now. Super sharp printing!',
    rating: 5
  },
  {
    id: 3,
    image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&auto=format&fit=crop',
    customer_name: 'Pooja K.',
    location: 'Delhi',
    caption: 'The motivational quote posters in the study room give so much positive energy.',
    rating: 5
  },
  {
    id: 4,
    image_url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=600&auto=format&fit=crop',
    customer_name: 'Vikram M.',
    location: 'Hyderabad',
    caption: 'The Interstellar black hole split canvas is huge and the colors are out of this world.',
    rating: 5
  },
  {
    id: 5,
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop',
    customer_name: 'Sneha R.',
    location: 'Pune',
    caption: 'Framing is solid and wooden borders are very clean. 10/10 recommendation.',
    rating: 5
  },
  {
    id: 6,
    image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop',
    customer_name: 'Kabir D.',
    location: 'Chennai',
    caption: 'Porsche 911 GT3 RS poster looks insane next to my racing simulator setup.',
    rating: 5
  },
  {
    id: 7,
    image_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=600&auto=format&fit=crop',
    customer_name: 'Diya N.',
    location: 'Kolkata',
    caption: 'Made a fairy lights memory wall with the vintage polaroid prints. Super aesthetic!',
    rating: 5
  },
  {
    id: 8,
    image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
    customer_name: 'Aditya P.',
    location: 'Ahmedabad',
    caption: 'Customized poster studio worked like magic. My artwork printed perfectly crisp.',
    rating: 5
  },
  {
    id: 9,
    image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
    customer_name: 'Tanvi J.',
    location: 'Jaipur',
    caption: 'Anime posters are vibrant and the anti-glare finish means no reflections from room lights.',
    rating: 5
  },
  {
    id: 10,
    image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
    customer_name: 'Harsh G.',
    location: 'Chandigarh',
    caption: 'Dark Knight minimalist art looks so sleek in my home office.',
    rating: 5
  },
  {
    id: 11,
    image_url: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=600&auto=format&fit=crop',
    customer_name: 'Kavita B.',
    location: 'Lucknow',
    caption: 'Brought peaceful zen vibes to our living room. Safe cylindrical tube delivery.',
    rating: 5
  },
  {
    id: 12,
    image_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=600&auto=format&fit=crop',
    customer_name: 'Nikhil T.',
    location: 'Indore',
    caption: 'Monaco GP track map poster is clean, sharp, and high resolution.',
    rating: 5
  }
];

// Default Customer Video Reviews & Unboxing Reels
export const defaultVideoReviews = [
  {
    id: 'v1',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-1230-large.mp4',
    customer_name: 'Megha V.',
    handle: '@megha.vibes',
    caption: 'Unboxing my 18-poster pack from CASIT! The 300 GSM paper is so thick ✨',
    views: '42.5K',
    likes: '3.8K',
    tagged_product: 'Ultimate Anime 18-Poster Pack'
  },
  {
    id: 'v2',
    thumbnail: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-standing-in-front-of-a-graffiti-wall-41617-large.mp4',
    customer_name: 'Aman Ray',
    handle: '@aman_setups',
    caption: 'POV: Setting up the Ferrari F1 split canvas on my room wall 🏎️💨',
    views: '89.1K',
    likes: '7.2K',
    tagged_product: 'Ferrari SF-24 Split Triptych'
  },
  {
    id: 'v3',
    thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-decorating-a-room-with-lights-42526-large.mp4',
    customer_name: 'Simran K.',
    handle: '@simran_decor',
    caption: 'Decorating my college dorm wall with retro polaroids & fairy lights! 💖',
    views: '120K',
    likes: '14.5K',
    tagged_product: '50 Retro Polaroid Prints Pack'
  },
  {
    id: 'v4',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-at-home-42409-large.mp4',
    customer_name: 'Devraj K.',
    handle: '@dev.codes',
    caption: 'Coding battlestation complete with Neo-Tokyo Cyber skyline posters 💻⚡',
    views: '64.2K',
    likes: '5.1K',
    tagged_product: 'Neo-Tokyo Cyber Skyline Split'
  },
  {
    id: 'v5',
    thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-taking-photos-with-a-retro-camera-42442-large.mp4',
    customer_name: 'Priyanka D.',
    handle: '@priya_art',
    caption: 'Customized photo studio unboxing! My artwork turned out super vibrant 🎨',
    views: '51.8K',
    likes: '4.9K',
    tagged_product: 'Design Your Own Custom Poster'
  },
  {
    id: 'v6',
    thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-young-man-exercising-in-a-gym-42488-large.mp4',
    customer_name: 'Sameer J.',
    handle: '@sameer_fit',
    caption: 'Gym motivation wall setup! High resolution & zero glare from lights 💪',
    views: '73.0K',
    likes: '6.4K',
    tagged_product: 'Discipline & Greatness Wall Pack'
  }
];

// Guaranteed Autoplay Video Element without static preview cover
function ReelCardVideo({ src, isUnmuted }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isUnmuted;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const startPlaying = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    };

    startPlaying();
  }, [src, isUnmuted]);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      loop
      muted={!isUnmuted}
      playsInline
      preload="auto"
      className="w-full h-full object-cover group-hover:scale-105 transition duration-700 bg-neutral-900"
    />
  );
}

export default function VerifiedReviews() {
  const [photoReviews, setPhotoReviews] = useState([]);
  const [videoReviews, setVideoReviews] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Modals
  const [activePhotoModal, setActivePhotoModal] = useState(null);
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const modalVideoRef = useRef(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('verified_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const dbPhotos = data.filter(item => !item.video_url);
        const dbVideos = data.filter(item => !!item.video_url);
        setPhotoReviews(dbPhotos);
        setVideoReviews(dbVideos);
      } else {
        setPhotoReviews([]);
        setVideoReviews([]);
      }
    } catch (err) {
      console.log('Error loading verified reviews:', err);
      setPhotoReviews([]);
      setVideoReviews([]);
    } finally {
      setIsLoaded(true);
    }
  };

  const hasPhotos = isLoaded && photoReviews && photoReviews.length > 0;
  const hasVideos = isLoaded && videoReviews && videoReviews.length > 0;

  if (!isLoaded || (!hasPhotos && !hasVideos)) {
    return null;
  }

  // Sound state for individual cards in the feed
  const [unmutedCardId, setUnmutedCardId] = useState(null);

  // Dual Row Photo reviews setup
  const midIndex = Math.ceil(photoReviews.length / 2);
  const row1 = photoReviews.slice(0, midIndex);
  const row2 = photoReviews.slice(midIndex);

  const row1Duplicated = row1.length > 0 ? [...row1, ...row1, ...row1] : [];
  const row2Duplicated = row2.length > 0 ? [...row2, ...row2, ...row2] : [];
  const videosDuplicated = videoReviews.length > 0 ? [...videoReviews, ...videoReviews, ...videoReviews] : [];

  const handleTogglePlay = () => {
    if (modalVideoRef.current) {
      if (isPlaying) {
        modalVideoRef.current.pause();
        setIsPlaying(false);
      } else {
        modalVideoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleToggleMute = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="py-12 sm:py-20 bg-white border-t border-gray-100 overflow-hidden relative space-y-12">
      
      {/* SECTION 1: VERIFIED REVIEWS (2-ROW PHOTO SCROLLER) */}
      {hasPhotos && (
        <div className="space-y-6">
          
          {/* Heading matching user screenshot */}
          <div className="text-center space-y-2 px-4" data-aos="fade-up">
            <h2 className="text-2xl sm:text-4xl font-black tracking-wider text-black uppercase flex items-center justify-center gap-2">
              <span>VERIFIED REVIEWS</span>
            </h2>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-500">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <span>4.9 / 5 Rated by 35,000+ Customer Wall Setups</span>
            </div>
          </div>

          {/* 2-Row Horizontal Photo Marquee (Pauses on Hover) */}
          <div className="marquee-container space-y-4 sm:space-y-6">
            
            {/* ROW 1 (Scrolls Left) */}
            <div className="flex overflow-hidden">
              <div className="animate-marquee-left flex gap-4 sm:gap-6 py-2 px-2">
                {row1Duplicated.map((review, idx) => (
                  <div
                    key={`r1-${review.id}-${idx}`}
                    onClick={() => setActivePhotoModal(review)}
                    className="group relative w-36 h-48 sm:w-56 sm:h-72 rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-300 shrink-0 bg-gray-100"
                  >
                    <img
                      src={review.image_url}
                      alt={review.customer_name || 'Verified Customer Review'}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-3 sm:p-4 text-white">
                      <div className="flex items-center gap-1 text-primary text-xs font-bold mb-1">
                        <ShieldCheck size={14} />
                        <span>{review.customer_name || 'Verified Buyer'}</span>
                      </div>
                      {review.caption && (
                        <p className="text-[10px] sm:text-xs text-gray-200 line-clamp-2 leading-snug">
                          "{review.caption}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ROW 2 (Scrolls Right) */}
            <div className="flex overflow-hidden">
              <div className="animate-marquee-right flex gap-4 sm:gap-6 py-2 px-2">
                {row2Duplicated.map((review, idx) => (
                  <div
                    key={`r2-${review.id}-${idx}`}
                    onClick={() => setActivePhotoModal(review)}
                    className="group relative w-36 h-48 sm:w-56 sm:h-72 rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-300 shrink-0 bg-gray-100"
                  >
                    <img
                      src={review.image_url}
                      alt={review.customer_name || 'Verified Customer Review'}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-3 sm:p-4 text-white">
                      <div className="flex items-center gap-1 text-primary text-xs font-bold mb-1">
                        <ShieldCheck size={14} />
                        <span>{review.customer_name || 'Verified Buyer'}</span>
                      </div>
                      {review.caption && (
                        <p className="text-[10px] sm:text-xs text-gray-200 line-clamp-2 leading-snug">
                          "{review.caption}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SECTION 2: CUSTOMER VIDEO REELS & UNBOXING (Vertical Video Scroller) */}
      {hasVideos && (
        <div className="space-y-6 pt-4 border-t border-gray-100">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 max-w-7xl mx-auto">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-extrabold mb-1">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                <span>CUSTOMER REELS</span>
              </div>
              <h3 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Watch Real Customers Unbox & Decorate
              </h3>
            </div>
            <span className="text-xs text-gray-500 font-semibold mt-1 sm:mt-0">
              Autoplays on mute • Click sound icon to listen
            </span>
          </div>

        {/* Video Reels Horizontal Scroller */}
        <div className="marquee-container overflow-hidden">
          <div className="animate-marquee-left flex gap-4 sm:gap-6 py-3 px-2">
            {videosDuplicated.map((vid, vIdx) => {
              const isCardUnmuted = unmutedCardId === `${vid.id}-${vIdx}`;
              return (
                <div
                  key={`vid-${vid.id}-${vIdx}`}
                  onClick={() => {
                    setActiveVideoModal(vid);
                    setIsPlaying(true);
                    setIsMuted(false);
                  }}
                  className="group relative w-44 h-72 sm:w-56 sm:h-96 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl border border-gray-200 transition-all duration-300 shrink-0 bg-neutral-900"
                >
                  {/* Direct Autoplay Video Element */}
                  {vid.video_url ? (
                    <ReelCardVideo src={vid.video_url} isUnmuted={isCardUnmuted} />
                  ) : null}

                  {/* Video Overlay Elements */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 flex flex-col justify-between p-4 text-white pointer-events-none">
                    
                    {/* Top Bar: Views & Sound Unmute Button */}
                    <div className="flex items-center justify-between pointer-events-auto">
                      <span className="text-[10px] bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                        <Play size={10} fill="currentColor" /> {vid.views}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUnmutedCardId(prev => (prev === `${vid.id}-${vIdx}` ? null : `${vid.id}-${vIdx}`));
                        }}
                        className={`p-2 rounded-full transition shadow-lg ${
                          isCardUnmuted
                            ? 'bg-primary text-black scale-110 font-bold'
                            : 'bg-black/70 text-white hover:bg-black'
                        }`}
                        title={isCardUnmuted ? 'Mute sound' : 'Unmute to listen'}
                      >
                        {isCardUnmuted ? <Volume2 size={13} /> : <VolumeX size={13} />}
                      </button>
                    </div>

                    {/* Bottom Caption & User */}
                    <div className="space-y-1">
                      <h5 className="font-extrabold text-sm text-white flex items-center gap-1">
                        <span>{vid.customer_name}</span>
                        <ShieldCheck size={14} className="text-primary" />
                      </h5>
                      <p className="text-[11px] text-gray-200 line-clamp-2 leading-snug">
                        {vid.caption}
                      </p>
                      {vid.tagged_product && (
                        <span className="inline-block text-[9px] bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-gray-100 font-medium truncate max-w-full">
                          🛍️ {vid.tagged_product}
                        </span>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
      )}


      {/* PHOTO LIGHTBOX MODAL */}
      {activePhotoModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActivePhotoModal(null)}
        >
          <div 
            className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePhotoModal(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition"
            >
              <X size={18} />
            </button>

            <div className="max-h-[65vh] overflow-hidden bg-black flex items-center justify-center">
              <img
                src={activePhotoModal.image_url}
                alt={activePhotoModal.customer_name}
                className="w-full h-auto max-h-[65vh] object-contain"
              />
            </div>

            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-gray-900 text-base flex items-center gap-1.5">
                    <span>{activePhotoModal.customer_name || 'Verified Buyer'}</span>
                    <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck size={12} /> Verified Purchase
                    </span>
                  </h4>
                  {activePhotoModal.location && (
                    <p className="text-xs text-gray-400">{activePhotoModal.location}</p>
                  )}
                </div>

                <div className="flex text-amber-400">
                  {[...Array(activePhotoModal.rating || 5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
              </div>

              {activePhotoModal.caption && (
                <p className="text-sm text-gray-600 leading-relaxed font-medium bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  "{activePhotoModal.caption}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}


      {/* VIDEO REEL PLAYER MODAL */}
      {activeVideoModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveVideoModal(null)}
        >
          <div 
            className="relative max-w-sm sm:max-w-md w-full bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-fade-in-up border border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveVideoModal(null)}
              className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition"
            >
              <X size={18} />
            </button>

            {/* Video Player */}
            <div className="relative aspect-[9/16] bg-black overflow-hidden flex items-center justify-center">
              <video
                ref={modalVideoRef}
                src={activeVideoModal.video_url}
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
                onClick={handleTogglePlay}
              />

              {/* Video Controls Overlay */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <button
                  onClick={handleToggleMute}
                  className="p-2 rounded-full bg-black/60 text-white hover:bg-black transition"
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <button
                  onClick={handleTogglePlay}
                  className="p-2 rounded-full bg-black/60 text-white hover:bg-black transition"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
              </div>

              {/* Video Bottom Info */}
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black via-black/60 to-transparent text-white space-y-2 z-20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-black font-extrabold flex items-center justify-center text-xs">
                    {activeVideoModal.customer_name?.[0] || 'C'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm leading-tight flex items-center gap-1">
                      <span>{activeVideoModal.customer_name}</span>
                      <ShieldCheck size={14} className="text-primary" />
                    </h4>
                    <span className="text-[11px] text-gray-300">{activeVideoModal.handle || '@casit.customer'}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-200 leading-relaxed font-medium">
                  {activeVideoModal.caption}
                </p>

                {activeVideoModal.tagged_product && (
                  <div className="pt-2">
                    <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-white truncate">
                        <ShoppingBag size={14} className="text-primary shrink-0" />
                        <span className="truncate">{activeVideoModal.tagged_product}</span>
                      </div>
                      <span className="text-[10px] bg-primary text-black font-extrabold px-2.5 py-1 rounded-full shrink-0">
                        Shop Look
                      </span>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </section>
  );
}
