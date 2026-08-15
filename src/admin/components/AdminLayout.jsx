import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Layers, Package, Star, LogOut, Sparkles } from 'lucide-react';
import logo from '../../assets/logo.png';

export default function AdminLayout({ onLogout }) {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-center">
          <img src={logo} alt="CASIT Logo" className="h-12 w-auto object-contain" />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-primary-light text-black font-bold border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </NavLink>
          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-primary-light text-black font-bold border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <Layers size={20} />
            <span className="font-medium">Categories</span>
          </NavLink>
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-primary-light text-black font-bold border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <Package size={20} />
            <span className="font-medium">Products</span>
          </NavLink>
          <NavLink
            to="/admin/custom-prints"
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-primary-light text-black font-bold border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-primary" />
              <span className="font-medium">Custom Prints</span>
            </div>
            <span className="text-[10px] bg-primary text-black font-extrabold px-1.5 py-0.5 rounded-full">
              STUDIO
            </span>
          </NavLink>
          <NavLink
            to="/admin/reels"
            className={({ isActive }) =>
              `flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-primary-light text-black font-bold border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Star size={20} className="text-amber-500 fill-amber-500/20" />
              <span className="font-medium">Customer Reels</span>
            </div>
            <span className="text-[10px] bg-red-500 text-white font-extrabold px-1.5 py-0.5 rounded-full">
              VIDEO
            </span>
          </NavLink>
          <NavLink
            to="/admin/reviews"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-primary-light text-black font-bold border-r-4 border-primary' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <Star size={20} />
            <span className="font-medium">Photo Reviews</span>
          </NavLink>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
