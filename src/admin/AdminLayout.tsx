import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tags, 
  Image as ImageIcon, 
  Ticket, 
  Archive, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  Activity,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  LogOut
} from 'lucide-react';

const MENU_ITEMS = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { path: '/admin/customers', icon: Users, label: 'Customers' },
  { path: '/admin/categories', icon: Tags, label: 'Categories' },
  { path: '/admin/banners', icon: ImageIcon, label: 'Banners' },
  { path: '/admin/coupons', icon: Ticket, label: 'Coupons' },
  { path: '/admin/inventory', icon: Archive, label: 'Inventory' },
  { path: '/admin/sales', icon: BarChart3, label: 'Sales Reports' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
  { path: '/admin/roles', icon: ShieldCheck, label: 'Roles & Permissions' },
  { path: '/admin/activity', icon: Activity, label: 'Activity Logs' },
];

export default function AdminLayout({ setIsAuthenticated, children }: { setIsAuthenticated: (v: boolean) => void, children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsMobile(true);
        setIsSidebarOpen(false);
      } else {
        setIsMobile(false);
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || !isMobile) && (
          <>
            {/* Mobile Backdrop */}
            {isMobile && isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            
            <motion.aside 
              initial={isMobile ? { x: -300 } : { width: 80 }}
              animate={isMobile ? { x: 0 } : { width: isSidebarOpen ? 280 : 80 }}
              exit={isMobile ? { x: -300 } : { width: 80 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed lg:relative z-50 h-full bg-black text-white flex flex-col border-r border-gold-500/20 shadow-[4px_0_24px_rgba(0,0,0,0.1)]"
            >
              {/* Logo Area */}
              <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
                <AnimatePresence mode="wait">
                  {isSidebarOpen && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center font-heading font-bold text-black text-xl shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                        R
                      </div>
                      <span className="font-heading font-bold text-xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-yellow-300">
                        Admin
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {(!isSidebarOpen && !isMobile) && (
                   <div className="w-10 h-10 mx-auto rounded-xl bg-gold-500 flex items-center justify-center font-heading font-bold text-black text-xl shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                     R
                   </div>
                )}
                
                {isMobile && (
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-stone-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Navigation Menu */}
              <div className="flex-1 overflow-y-auto scrollbar-hide py-6 px-4 flex flex-col gap-2">
                {MENU_ITEMS.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      title={!isSidebarOpen ? item.label : undefined}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${
                        isActive 
                          ? 'bg-gold-500/10 text-gold-500 border border-gold-500/20 shadow-[inset_0_1px_4px_rgba(212,175,55,0.1)]' 
                          : 'text-stone-400 hover:text-white hover:bg-white/5'
                      } ${!isSidebarOpen && !isMobile ? 'justify-center px-0' : ''}`}
                    >
                      <item.icon size={22} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                      <AnimatePresence>
                        {isSidebarOpen && (
                          <motion.span 
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="font-medium whitespace-nowrap overflow-hidden"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {isActive && isSidebarOpen && (
                        <motion.div 
                          layoutId="active-indicator"
                          className="w-1.5 h-6 bg-gold-500 rounded-full ml-auto shadow-[0_0_8px_rgba(212,175,55,0.8)]"
                        />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-stone-200 shadow-sm flex items-center justify-between px-6 lg:px-10 z-30 relative">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 bg-stone-100 hover:bg-gold-500 hover:text-black rounded-xl text-stone-600 transition-all duration-300 hidden lg:block shadow-sm"
            >
              <Menu size={22} />
            </button>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 bg-stone-100 hover:bg-gold-500 hover:text-black rounded-xl text-stone-600 transition-all duration-300 lg:hidden shadow-sm"
            >
              <Menu size={22} />
            </button>

            {/* Global Search */}
            <div className="hidden md:flex items-center bg-stone-100 rounded-full px-4 py-2.5 w-96 border border-transparent focus-within:border-gold-500/50 focus-within:bg-white focus-within:shadow-[0_4px_20px_rgba(212,175,55,0.08)] transition-all duration-300">
              <Search size={18} className="text-stone-400" />
              <input 
                type="text" 
                placeholder="Search products, orders, or customers..." 
                className="bg-transparent border-none outline-none w-full ml-3 text-sm font-medium text-stone-700 placeholder:text-stone-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <button className="relative p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-stone-100"></span>
            </button>

            <div className="h-8 w-px bg-stone-200 hidden sm:block"></div>

            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-600 to-yellow-400 p-[2px]">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-gold-500 font-bold font-heading">A</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-stone-800">Admin</p>
                <p className="text-xs text-stone-500 font-medium">Super Admin</p>
              </div>
              <ChevronDown size={16} className="text-stone-400 group-hover:text-gold-600 transition-colors hidden sm:block" />
            </div>
            
            <button onClick={handleLogout} className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-stone-50 p-6 lg:p-10 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
