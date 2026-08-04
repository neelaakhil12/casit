import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Trash2, ShoppingBag, Percent, ArrowRight, Tag } from 'lucide-react';

export default function Cart() {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    navigateTo, 
    user, 
    setLoginModalOpen 
  } = useContext(AppContext);

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponStatus, setCouponStatus] = useState({ active: false, error: '', successMsg: '' });
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  // Subtotal calculations
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Delivery Charge rule: Free delivery above 999, else 99
  const deliveryCharge = (subtotal === 0 || subtotal >= 999) ? 0 : 99;

  // Coupon apply
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const normalizedCode = couponCode.trim().toUpperCase();
    if (normalizedCode === 'CASIT10') {
      setDiscountPercent(0.10); // 10% discount
      setCouponStatus({ active: true, error: '', successMsg: 'CASIT10 code applied! (10% Off)' });
    } else if (normalizedCode === 'WELCOME20') {
      setDiscountPercent(0.20); // 20% discount
      setCouponStatus({ active: true, error: '', successMsg: 'WELCOME20 code applied! (20% Off)' });
    } else {
      setDiscountPercent(0);
      setCouponStatus({ active: false, error: 'Invalid coupon code. Try WELCOME20 or CASIT10.', successMsg: '' });
    }
  };

  const discountAmount = Math.round(subtotal * discountPercent);
  const totalAmount = subtotal - discountAmount + deliveryCharge;

  const handleCheckout = () => {
    if (!user.loggedIn) {
      setLoginModalOpen(true);
      return;
    }
    setCheckoutComplete(true);
    // Clear cart after short delay
    setTimeout(() => {
      cart.forEach(item => removeFromCart(item.cartItemId));
    }, 100);
  };

  if (checkoutComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6" data-aos="zoom-in">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-black font-bold text-4xl mx-auto shadow-yellow-glow animate-bounce">
          ✓
        </div>
        <h2 className="text-3xl font-black text-gray-900">Order Placed Successfully!</h2>
        <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
          Thank you for shopping with CASIT. We have received your order and our printing lab will begin customizing your posters shortly. A confirmation details link has been sent to your email.
        </p>
        <div className="pt-4">
          <button 
            onClick={() => { setCheckoutComplete(false); navigateTo('home'); }}
            className="btn-primary text-xs"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-12">
      
      {/* Page Title */}
      <div className="border-b border-gray-100 pb-5" data-aos="fade-down">
        <h1 className="text-3xl font-extrabold text-gray-900 m-0">Shopping Cart</h1>
        <p className="text-xs text-gray-400 mt-1">Review items added to your checkout basket.</p>
      </div>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Cart items list */}
          <div className="lg:col-span-8 space-y-6" data-aos="fade-right">
            {cart.map((item) => (
              <div 
                key={item.cartItemId}
                className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 group hover:shadow-md transition duration-300"
              >
                {/* Product Image & Meta */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <div className="w-20 h-24 rounded-2xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{item.product.name}</h3>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[10px] text-gray-500 font-semibold uppercase">
                      <span>Size: {item.size}</span>
                      <span className="text-gray-300">•</span>
                      <span>Frame: {item.framed ? 'Yes' : 'No'}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900 block sm:hidden pt-1">₹{item.price} each</span>
                  </div>
                </div>

                {/* Pricing & Quantity modifier */}
                <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                  <span className="text-sm font-extrabold text-gray-900 hidden sm:block">₹{item.price}</span>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-gray-200 rounded-full p-0.5 bg-gray-50 max-w-[100px] justify-between w-full">
                    <button 
                      onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center font-bold hover:bg-white rounded-full transition"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center font-bold hover:bg-white rounded-full transition"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm font-extrabold text-black w-16 text-right">₹{item.price * item.quantity}</span>

                  <button 
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition"
                    title="Remove Item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Checkout Breakdown */}
          <div className="lg:col-span-4 space-y-6" data-aos="fade-left">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl space-y-6">
              <h3 className="text-base font-bold text-gray-900 m-0">Order Summary</h3>
              
              <div className="space-y-3.5 text-xs font-semibold text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="text-gray-900">₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="text-gray-900">
                    {deliveryCharge === 0 ? <span className="text-green-600 font-bold uppercase">Free</span> : `₹${deliveryCharge}`}
                  </span>
                </div>
                {deliveryCharge > 0 && (
                  <p className="text-[10px] text-gray-400 font-medium leading-tight">
                    Add ₹{999 - subtotal} more to unlock free shipping!
                  </p>
                )}
                <hr className="border-gray-100" />
                <div className="flex justify-between text-sm font-extrabold text-black pt-1">
                  <span>Total Amount</span>
                  <span className="text-lg">₹{totalAmount}</span>
                </div>
              </div>

              {/* Coupon Box */}
              <form onSubmit={handleApplyCoupon} className="space-y-2.5 pt-2 border-t border-gray-100">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Have a Coupon?</label>
                <div className="flex gap-2">
                  <div className="relative w-full">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Tag size={14} />
                    </span>
                    <input 
                      type="text" 
                      placeholder="e.g. WELCOME20, CASIT10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white text-xs font-semibold uppercase"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="px-4 py-2.5 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-bold transition"
                  >
                    Apply
                  </button>
                </div>
                {couponStatus.error && (
                  <p className="text-[10px] text-red-500 font-bold">{couponStatus.error}</p>
                )}
                {couponStatus.successMsg && (
                  <p className="text-[10px] text-green-600 font-bold">{couponStatus.successMsg}</p>
                )}
              </form>

              {/* Checkout CTA */}
              <button 
                onClick={handleCheckout}
                className="w-full py-4 bg-primary text-black font-extrabold rounded-2xl shadow-yellow-glow hover:bg-primary-hover hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-sm flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              {/* Safe payments assurance */}
              <div className="text-center pt-2">
                <span className="text-[9px] text-gray-400 font-medium leading-relaxed block">
                  🔒 Secure checkout powered by SSL 256-bit encryption. <br />
                  Easy return and exchanges.
                </span>
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* Empty Cart State */
        <div className="text-center py-20 space-y-5" data-aos="zoom-in">
          <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto">
            <ShoppingBag size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">Your Cart is Empty</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
              Explore our wide variety of categories and add premium wall posters to your cart to customize your rooms.
            </p>
          </div>
          <div className="pt-2">
            <button 
              onClick={() => navigateTo('categories')}
              className="btn-primary text-xs"
            >
              Shop Posters Now
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
