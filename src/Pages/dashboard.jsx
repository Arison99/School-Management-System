import { useState, useEffect } from 'react';
import { Search, Users, School, Home, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [schoolPhoto, setSchoolPhoto] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchoolPhoto = async () => {
      try {
        const response = await axios.get('/api/school-photo/');
        setSchoolPhoto(response.data.photo);
      } catch (error) {
        console.error('Error fetching school photo:', error);
      }
    };

    fetchSchoolPhoto();
  }, []);

  const navigationItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Users, label: 'Students', path: '/dashboard/student' },
    { icon: School, label: 'School', path: '/dashboard/school' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="h-16 bg-white shadow-sm fixed w-full top-0 z-50 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold text-blue-600">SchoolMS</Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            {schoolPhoto ? (
              <img
                src={schoolPhoto}
                alt="School"
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <img
                src="/api/placeholder/40/40"
                alt="Placeholder"
                className="h-8 w-8 rounded-full"
              />
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 h-full bg-white shadow-lg transition-all duration-300 ${
          isHovered ? 'w-64' : 'w-16'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="py-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors duration-200 ${
                    isActive ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span
                    className={`ml-4 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    } transition-opacity duration-200`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors duration-200 w-full"
            >
              <LogOut className="h-5 w-5" />
              <span
                className={`ml-4 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                } transition-opacity duration-200`}
              >
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={`pt-20 ${isHovered ? 'ml-64' : 'ml-16'} transition-all duration-300 p-6`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;