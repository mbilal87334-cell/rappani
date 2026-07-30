import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tags, 
  DollarSign,
  CreditCard,
  Settings,
  Ticket,
  Star,
  Bell,
  FileText,
  BarChart3,
  User,
  Menu,
  X,
  Search,
  LogOut
} from 'lucide-react';

const MENU_ITEMS = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/categories', icon: Tags, label: 'Categories' },
  { path: '/admin/customers', icon: Users, label: 'Customers' },
  { path: '/admin/revenue', icon: DollarSign, label: 'Revenue' },
  { path: '/admin/transactions', icon: CreditCard, label: 'Transactions' },
  { path: '/admin/settings', icon: Settings, label: 'Website Settings' },
  { path: '/admin/coupons', icon: Ticket, label: 'Coupons' },
  { path: '/admin/reviews', icon: Star, label: 'Reviews' },
  { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { path: '/admin/reports', icon: FileText, label: 'Reports' },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/admin/profile', icon: User, label: 'Profile' },
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
    <div className="flex h-screen bg-neutral-100 overflow-hidden font-sans">
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
                className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            
            <motion.aside 
              initial={isMobile ? { x: -300 } : { width: 80 }}
              animate={isMobile ? { x: 0 } : { width: isSidebarOpen ? 260 : 80 }}
              exit={isMobile ? { x: -300 } : { width: 80 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed lg:relative z-50 h-full bg-primary text-neutral-300 flex flex-col border-r border-primary-light shadow-2xl"
            >
              {/* Logo Area */}
              <div className="h-20 flex items-center justify-between px-6 border-b border-primary-light/50">
                <AnimatePresence mode="wait">
                  {isSidebarOpen && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center"
                    >
                      <span className="font-black text-xl tracking-tight text-white leading-tight">
                        Rappani<br />Admin
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {(!isSidebarOpen && !isMobile) && (
                   <div className="w-10 h-10 mx-auto bg-primary-light rounded-xl flex items-center justify-center font-bold text-gold-500 shadow-inner">
                     R
                   </div>
                )}
                
                {isMobile && (
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-primary-light rounded-xl text-neutral-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Navigation Menu */}
              <div className="flex-1 overflow-y-auto scrollbar-hide py-6 flex flex-col gap-1.5 px-3">
                {MENU_ITEMS.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      title={!isSidebarOpen ? item.label : undefined}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-gold-500/10 text-gold-500 font-bold shadow-sm' 
                          : 'text-neutral-400 hover:text-white hover:bg-primary-light'
                      } ${!isSidebarOpen && !isMobile ? 'justify-center px-0' : ''}`}
                    >
                      <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-gold-500' : 'text-neutral-400'} />
                      <AnimatePresence>
                        {isSidebarOpen && (
                          <motion.span 
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="whitespace-nowrap overflow-hidden text-[14px] tracking-wide"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </NavLink>
                  );
                })}
                
                <div className="mt-auto pt-6 pb-2">
                  <button 
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-crimson-500 hover:bg-crimson-500/10 ${!isSidebarOpen && !isMobile ? 'justify-center px-0' : ''}`}
                  >
                    <LogOut size={20} strokeWidth={2} />
                    {isSidebarOpen && <span className="whitespace-nowrap font-bold text-[14px] tracking-wide">Logout</span>}
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-neutral-100">
        {/* Top Navigation */}
        <header className="h-20 bg-white border-b border-neutral-200 flex items-center justify-between px-6 z-30 relative shadow-sm">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-primary hover:bg-neutral-100 rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors relative">
               <User size={22} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
