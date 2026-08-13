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
  LogOut,
  MessageSquare
} from 'lucide-react';

const ALL_MENU_ITEMS = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', roles: ['superadmin', 'shopadmin'] },
  { path: '/admin/shops', icon: Users, label: 'Shops & Admins', roles: ['superadmin'] },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Orders', roles: ['superadmin', 'shopadmin'] },
  { path: '/admin/products', icon: Package, label: 'Products', roles: ['superadmin', 'shopadmin'] },
  { path: '/admin/categories', icon: Tags, label: 'Categories', roles: ['superadmin'] },
  { path: '/admin/customers', icon: Users, label: 'Customers', roles: ['superadmin', 'shopadmin'] },
  { path: '/admin/revenue', icon: DollarSign, label: 'Revenue', roles: ['superadmin', 'shopadmin'] },
  { path: '/admin/transactions', icon: CreditCard, label: 'Transactions', roles: ['superadmin', 'shopadmin'] },
  { path: '/admin/whatsapp', icon: MessageSquare, label: 'WhatsApp Bot', roles: ['superadmin'] },
  { path: '/admin/settings', icon: Settings, label: 'Website Settings', roles: ['superadmin'] },
  { path: '/admin/coupons', icon: Ticket, label: 'Coupons', roles: ['superadmin'] },
  { path: '/admin/reviews', icon: Star, label: 'Reviews', roles: ['superadmin'] },
  { path: '/admin/notifications', icon: Bell, label: 'Notifications', roles: ['superadmin'] },
  { path: '/admin/reports', icon: FileText, label: 'Reports', roles: ['superadmin', 'shopadmin'] },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics', roles: ['superadmin', 'shopadmin'] },
  { path: '/admin/profile', icon: User, label: 'Profile', roles: ['superadmin', 'shopadmin'] },
];

export default function AdminLayout({ setIsAuthenticated, children }: { setIsAuthenticated: (v: boolean) => void, children: React.ReactNode }) {
  const [userRole, setUserRole] = useState('superadmin');
  
  useEffect(() => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role || 'superadmin');
      }
    } catch (e) {
      console.error("Failed to parse token");
    }
  }, []);

  const MENU_ITEMS = ALL_MENU_ITEMS.filter(item => item.roles.includes(userRole));
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
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
    localStorage.removeItem('adminToken');
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
                className="fixed inset-0 bg-primary/30 z-40 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            
            <motion.aside 
              initial={isMobile ? { x: -300 } : { width: 80 }}
              animate={isMobile ? { x: 0 } : { width: isSidebarOpen ? 260 : 80 }}
              exit={isMobile ? { x: -300 } : { width: 80 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed lg:relative z-50 h-full bg-white text-primary flex flex-col border-r border-neutral-300 shadow-sm"
            >
              {/* Logo Area */}
              <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-300/50">
                <AnimatePresence mode="wait">
                  {isSidebarOpen && (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center"
                    >
                      <span className="font-semibold text-lg tracking-tight text-primary leading-tight">
                        Rappani<br />Store
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {(!isSidebarOpen && !isMobile) && (
                   <div className="w-8 h-8 mx-auto bg-neutral-100 rounded flex items-center justify-center font-bold text-primary">
                     N
                   </div>
                )}
                
                {isMobile && (
                  <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 hover:bg-neutral-100 rounded-md text-neutral-500 transition-colors">
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
                          ? 'bg-neutral-100 text-primary font-medium' 
                          : 'text-neutral-500 hover:text-primary hover:bg-neutral-100'
                      } ${!isSidebarOpen && !isMobile ? 'justify-center px-0 mx-4' : ''}`}
                    >
                      <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-primary' : 'text-neutral-500'} />
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
        <header className="h-14 bg-white border-b border-neutral-300 flex items-center justify-between px-4 z-30 relative">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-md transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex items-center gap-4 pr-2">
            <div className="hidden md:flex items-center relative">
              <input 
                type="text" 
                placeholder="Global Search..." 
                className="w-64 pl-9 pr-4 py-1.5 bg-neutral-100 border-none rounded-full text-sm focus:ring-2 focus:ring-gold-500 focus:bg-white outline-none transition-all"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2" />
            </div>
            
            <button className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors relative" onClick={() => navigate('/admin/notifications')}>
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>

            <button className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors" onClick={() => navigate('/admin/profile')}>
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
