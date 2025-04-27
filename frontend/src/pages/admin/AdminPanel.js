import React, { useEffect, useState } from "react";
import api from '../../api'; 
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, ChevronDown, ChevronUp, RefreshCw, UserPlus, AlertCircle } from "lucide-react";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    totalPortfolios: 0,
    activeUsers: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Fetch all users and calculate stats
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
          setError("No authentication token found. Please log in again.");
          navigate("/");
          return;
        }
        
        console.log("Making API call to fetch users");
        const res = await api.get('/admin/users');
        
        console.log("API response:", res.data);
        setUsers(res.data);
        
        // Calculate statistics
        const adminUsers = res.data.filter(user => user.role === 'admin').length;
        const totalPortfolios = res.data.reduce((sum, user) => sum + (user.portfolio?.length || 0), 0);
        const activeUsers = res.data.filter(user => (user.portfolio?.length || 0) > 0).length;
        
        setStats({
          totalUsers: res.data.length,
          adminUsers,
          totalPortfolios,
          activeUsers,
        });
        
        setError(null);
      } catch (err) {
        console.error("Admin fetch error:", err);
        if (err.response) {
          console.error("Error response data:", err.response.data);
          console.error("Error response status:", err.response.status);
          
          if (err.response.status === 401) {
            setError("Authentication error. Please log in again.");
            localStorage.removeItem("token");  // Clear invalid token
            navigate("/");
          } else if (err.response.status === 403) {
            setError("Access denied. You need admin privileges.");
          } else {
            setError(`Failed to load users: ${err.response.data.error || err.response.data.msg || "Unknown error"}`);
          }
        } else if (err.request) {
          setError("No response from server. Please check if the backend is running.");
        } else {
          setError(`Request error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAllUsers();
  }, [navigate]);

  // Handle sort functionality
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Get sorted users
  const getSortedUsers = () => {
    const sortableUsers = [...users];
    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        // Handle nested properties like portfolio.length
        if (sortConfig.key === 'portfolioCount') {
          const aValue = a.portfolio?.length || 0;
          const bValue = b.portfolio?.length || 0;
          if (sortConfig.direction === 'ascending') {
            return aValue - bValue;
          }
          return bValue - aValue;
        }
        
        // Handle regular properties
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  };

  // Apply search filter
  const filteredUsers = getSortedUsers().filter(user => {
    return (
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Refresh data - use the api instance for consistency
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
      
      // Recalculate stats
      const adminUsers = res.data.filter(user => user.role === 'admin').length;
      const totalPortfolios = res.data.reduce((sum, user) => sum + (user.portfolio?.length || 0), 0);
      const activeUsers = res.data.filter(user => (user.portfolio?.length || 0) > 0).length;
      
      setStats({
        totalUsers: res.data.length,
        adminUsers,
        totalPortfolios,
        activeUsers,
      });
    } catch (err) {
      console.error("Refresh error:", err);
      if (err.response && err.response.status === 401) {
        setError("Authentication error. Please log in again.");
        localStorage.removeItem("token");
        navigate("/");
      } else {
        alert("Failed to refresh data");
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleRoleChange = async (userId, currentRole) => {
    try {
      const newRole = currentRole === "admin" ? "user" : "admin";
      
      // Use the api instance for consistency
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      
      // Update the local state
      setUsers(prevUsers =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
      
      // Update admin count
      setStats(prevStats => ({
        ...prevStats,
        adminUsers: newRole === "admin" 
          ? prevStats.adminUsers + 1 
          : prevStats.adminUsers - 1
      }));
    } catch (err) {
      console.error("Role update error:", err);
      if (err.response && err.response.status === 401) {
        setError("Authentication error. Please log in again.");
        localStorage.removeItem("token");
        navigate("/");
      } else {
        alert("Failed to update user role");
      }
    }
  };

  // Chart data for user statistics
  const chartData = [
    { name: 'Total Users', value: stats.totalUsers, fill: '#60a5fa' },
    { name: 'Admin Users', value: stats.adminUsers, fill: '#7c3aed' },
    { name: 'Active Users', value: stats.activeUsers, fill: '#10b981' },
    { name: 'Total Portfolios', value: stats.totalPortfolios, fill: '#f59e0b' }
  ];

  // Render loading state
  if (loading) {
    return (
      <div className="p-6 text-white bg-gray-900 min-h-screen flex justify-center items-center">
        <div className="text-xl flex items-center">
          <RefreshCw className="animate-spin mr-2" size={24} />
          Loading...
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-6 text-white bg-gray-900 min-h-screen flex justify-center items-center">
        <div className="bg-red-800 p-4 rounded">
          <div className="flex items-center mb-2">
            <AlertCircle size={24} className="mr-2" />
            <h2 className="text-xl font-bold">Error</h2>
          </div>
          <p>{error}</p>
          <button 
            className="mt-4 bg-blue-600 py-2 px-4 rounded hover:bg-blue-700"
            onClick={() => navigate("/dashboard")}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-400">Admin Panel</h1>
        <div className="flex space-x-4">
          <button 
            className={`py-2 px-4 rounded ${refreshing ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <div className="flex items-center">
              <RefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} size={16} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </div>
          </button>
          <button 
            className="bg-blue-600 py-2 px-4 rounded hover:bg-blue-700"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-700">
        <div className="flex space-x-4">
          <button
            className={`py-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-blue-400 text-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('users')}
          >
            Users Management
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'stats' ? 'border-b-2 border-blue-400 text-blue-400' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('stats')}
          >
            Platform Statistics
          </button>
        </div>
      </div>
      
      {activeTab === 'users' ? (
        <>
          {/* Search and Stats Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="flex items-center bg-gray-800 rounded p-2 mb-4 md:mb-0 w-full md:w-auto">
              <Search className="text-gray-400 mr-2" size={20} />
              <input
                type="text"
                placeholder="Search users..."
                className="bg-transparent border-none focus:outline-none text-white w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-4 w-full md:w-auto justify-center md:justify-end">
              <div className="bg-blue-900 p-3 rounded shadow-md">
                <p className="text-sm text-blue-300">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="bg-purple-900 p-3 rounded shadow-md">
                <p className="text-sm text-purple-300">Admin Users</p>
                <p className="text-2xl font-bold">{stats.adminUsers}</p>
              </div>
              <div className="bg-green-900 p-3 rounded shadow-md">
                <p className="text-sm text-green-300">Active Users</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
              </div>
              <div className="bg-yellow-900 p-3 rounded shadow-md">
                <p className="text-sm text-yellow-300">Total Portfolios</p>
                <p className="text-2xl font-bold">{stats.totalPortfolios}</p>
              </div>
            </div>
          </div>
          
          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left bg-gray-800 rounded shadow">
              <thead>
                <tr className="bg-gray-700">
                  <th className="p-3 cursor-pointer" onClick={() => requestSort('name')}>
                    <div className="flex items-center">
                      Name
                      {sortConfig.key === 'name' && (
                        sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => requestSort('email')}>
                    <div className="flex items-center">
                      Email
                      {sortConfig.key === 'email' && (
                        sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => requestSort('role')}>
                    <div className="flex items-center">
                      Role
                      {sortConfig.key === 'role' && (
                        sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => requestSort('portfolioCount')}>
                    <div className="flex items-center">
                      Portfolio Count
                      {sortConfig.key === 'portfolioCount' && (
                        sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="border-t border-gray-700 hover:bg-gray-600">
                      <td className="p-3">{user.name || "N/A"}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded ${
                          user.role === "admin" ? "bg-purple-700" : "bg-blue-700"
                        }`}>
                          {user.role || "user"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center">
                          {user.portfolio?.length || 0}
                          {(user.portfolio?.length || 0) > 0 && (
                            <button 
                              className="ml-2 text-xs bg-gray-700 hover:bg-gray-600 rounded px-2 py-1"
                              onClick={() => alert(`Portfolio detail view would go here for ${user.name}`)}
                            >
                              View
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRoleChange(user._id, user.role)}
                            className={`px-3 py-1 rounded flex items-center ${
                              user.role === "admin"
                                ? "bg-yellow-600 hover:bg-yellow-700"
                                : "bg-purple-600 hover:bg-purple-700"
                            }`}
                          >
                            <UserPlus className="mr-1" size={16} />
                            {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-3 text-center text-gray-400">
                      No users found matching search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        // Statistics Tab
        <div className="bg-gray-800 p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Platform Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="text-lg font-semibold mb-3">User Statistics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.25rem' }} 
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Legend />
                  <Bar dataKey="value" name="Count" fill="#60a5fa" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="text-lg font-semibold mb-3">Key Metrics</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-800 p-3 rounded flex justify-between items-center">
                  <span>User Engagement Rate</span>
                  <span className="font-bold text-green-400">
                    {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}%
                  </span>
                </div>
                
                <div className="bg-gray-800 p-3 rounded flex justify-between items-center">
                  <span>Avg. Portfolios per User</span>
                  <span className="font-bold text-blue-400">
                    {stats.totalUsers > 0 ? (stats.totalPortfolios / stats.totalUsers).toFixed(2) : 0}
                  </span>
                </div>
                
                <div className="bg-gray-800 p-3 rounded flex justify-between items-center">
                  <span>Admin to User Ratio</span>
                  <span className="font-bold text-purple-400">
                    {stats.totalUsers > 0 ? 
                      `1:${Math.round((stats.totalUsers - stats.adminUsers) / (stats.adminUsers || 1))}` : 
                      'N/A'}
                  </span>
                </div>
                
                <div className="bg-gray-800 p-3 rounded flex justify-between items-center">
                  <span>Inactive Users</span>
                  <span className="font-bold text-yellow-400">
                    {stats.totalUsers - stats.activeUsers}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;