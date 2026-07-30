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
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden font-sans">
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
                className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            
            <motion.aside 
              initial={isMobile ? { x: -300 } : { width: 80 }}
              animate={isMobile ? { x: 0 } : { width: isSidebarOpen ? 260 : 80 }}
              exit={isMobile ? { x: -300 } : { width: 80 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed lg:relative z-50 h-full bg-white text-gray-800 flex flex-col border-r border-gray-200 shadow-sm"
            >
              {/* Logo Area */}
              <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                <AnimatePresence mode="wait">
                  {isSidebarOpen && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center"
                    >
                      <span className="font-semibold text-lg tracking-tight text-gray-900 leading-tight">
                        Rappani<br />Store
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {(!isSidebarOpen && !isMobile) && (
                   <div className="w-8 h-8 mx-auto bg-gray-100 rounded flex items-center justify-center font-bold text-gray-800">
                     N
                   </div>
                )}
                
                {isMobile && (
                  <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors">
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Navigation Menu */}
              <div className="flex-1 overflow-y-auto scrollbar-hide py-4 flex flex-col gap-1">
                {MENU_ITEMS.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      title={!isSidebarOpen ? item.label : undefined}
                      className={`flex items-center gap-4 px-6 py-2.5 mx-2 rounded-md transition-colors ${
                        isActive 
                          ? 'bg-gray-100 text-gray-900 font-medium' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      } ${!isSidebarOpen && !isMobile ? 'justify-center px-0 mx-4' : ''}`}
                    >
                      <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-gray-900' : 'text-gray-500'} />
                      <AnimatePresence>
                        {isSidebarOpen && (
                          <motion.span 
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="whitespace-nowrap overflow-hidden text-[15px]"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </NavLink>
                  );
                })}
                
                {/* Logout Button in Sidebar */}
                <button 
                  onClick={handleLogout}
                  className={`flex items-center gap-4 px-6 py-2.5 mx-2 mt-2 rounded-md transition-colors text-red-600 hover:bg-red-50 ${!isSidebarOpen && !isMobile ? 'justify-center px-0 mx-4' : ''}`}
                >
                  <LogOut size={20} strokeWidth={2} />
                  {isSidebarOpen && <span className="whitespace-nowrap font-medium text-[15px]">Logout</span>}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30 relative">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center">
              {/* Optional top bar search or actions */}
            </div>
            
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
               {/* Used for global actions if any, but profile is standard here */}
               <User size={22} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F9FAFB] p-4 lg:p-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
