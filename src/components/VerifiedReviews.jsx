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

// Verified Reviews Data (strictly real database items only)
export const defaultVerifiedReviews = [];
export const defaultVideoReviews = [];

// Guaranteed Autoplay Video Element without static preview cover
function ReelCardVideo({ src, isUnmuted }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    video.muted = !isUnmuted;
    video.defaultMuted = true;
    video.playsInline = true;

    try {
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
    } catch (_) {}

    const startPlaying = () => {
      try {
        const playPromise = video.play();
        if (playPromise !== undefined && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            if (video) {
              video.muted = true;
              video.play().catch(() => {});
            }
          });
        }
      } catch (_) {}
    };

    startPlaying();
  }, [src, isUnmuted]);

  if (!src) return null;

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      loop
      muted={!isUnmuted}
      playsInline
      preload="metadata"
      className="w-full h-full object-cover group-hover:scale-105 transition duration-700 bg-neutral-900"
    />
  );
}

export default function VerifiedReviews() {
  const [photoReviews, setPhotoReviews] = useState([]);
  const [videoReviews, setVideoReviews] = useState([]);
  
  // Modals & Sound
  const [activePhotoModal, setActivePhotoModal] = useState(null);
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [unmutedCardId, setUnmutedCardId] = useState(null);
  const modalVideoRef = useRef(null);

  useEffect(() => {
    fetchReviews();

    // Supabase Realtime Auto-Sync: storefront instantly updates when admin adds or deletes!
    const channel = supabase
      .channel('realtime_verified_reviews')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'verified_reviews' }, () => {
        fetchReviews();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('verified_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const dbPhotos = data.filter(item => item && !item.video_url && (item.image_url || item.thumbnail));
        const dbVideos = data.filter(item => item && item.video_url);
        setPhotoReviews(dbPhotos);
        setVideoReviews(dbVideos);
      } else {
        setPhotoReviews([]);
        setVideoReviews([]);
      }
    } catch (err) {
      console.warn('Error loading verified reviews:', err);
      setPhotoReviews([]);
      setVideoReviews([]);
    }
  };

  const safePhotos = Array.isArray(photoReviews) ? photoReviews : [];
  const safeVideos = Array.isArray(videoReviews) ? videoReviews : [];

  const hasPhotos = safePhotos.length > 0;
  const hasVideos = safeVideos.length > 0;

  if (!hasPhotos && !hasVideos) {
    return null;
  }

  // Helper to ensure enough cards for continuous seamless marquee
  const duplicateForMarquee = (arr, minCount = 8) => {
    if (!arr || arr.length === 0) return [];
    let result = [...arr];
    while (result.length < minCount) {
      result = [...result, ...arr];
    }
    return [...result, ...result]; // 2x loop for marquee
  };

  // Photo rows setup
  const midIndex = Math.max(1, Math.ceil(safePhotos.length / 2));
  const row1Raw = safePhotos.slice(0, midIndex);
  const row2Raw = safePhotos.length > 1 ? safePhotos.slice(midIndex) : safePhotos;

  const row1Duplicated = duplicateForMarquee(row1Raw, 6);
  const row2Duplicated = duplicateForMarquee(row2Raw, 6);
  const videosDuplicated = duplicateForMarquee(safeVideos, 6);

  const handleTogglePlay = () => {
    if (modalVideoRef.current) {
      try {
        if (isPlaying) {
          modalVideoRef.current.pause();
          setIsPlaying(false);
        } else {
          modalVideoRef.current.play().catch(() => {});
          setIsPlaying(true);
        }
      } catch (_) {}
    }
  };

  const handleToggleMute = () => {
    if (modalVideoRef.current) {
      try {
        modalVideoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
      } catch (_) {}
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
                      src={review.image_url || review.thumbnail}
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
                      src={review.image_url || review.thumbnail}
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
