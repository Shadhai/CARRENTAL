// // src/App.jsx - FIXED VERSION
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// // Components
// import Navbar from './components/Navbar';
// import ProtectedRoute from './components/ProtectedRoute';

// // Pages
// import Home from './pages/Home';
// import Login from './pages/Login';
// import Signup from './pages/Signup';
// import CarList from './pages/CarList';
// import Booking from './pages/Booking';
// import Profile from './pages/Profile';
// import AdminDashboard from './pages/AdminDashboard';
// import NotFound from './pages/NotFound';

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <div className="App">
//           <Navbar />
//           <main>
//             <Routes>
//               {/* Public Routes */}
//               <Route path="/" element={<Home />} />
//               <Route path="/login" element={<Login />} />
//               <Route path="/signup" element={<Signup />} />
//               <Route path="/cars" element={<CarList />} />
              
//               {/* Protected Routes */}
//               <Route path="/booking" element={
//                 <ProtectedRoute>
//                   <Booking />
//                 </ProtectedRoute>
//               } />
              
//               <Route path="/profile" element={
//                 <ProtectedRoute>
//                   <Profile />
//                 </ProtectedRoute>
//               } />
              
//               <Route path="/my-bookings" element={
//                 <ProtectedRoute>
//                   <Profile />
//                 </ProtectedRoute>
//               } />
              
//               {/* Admin Only Routes */}
//               <Route path="/admin" element={
//                 <ProtectedRoute adminOnly={true}>
//                   <AdminDashboard />
//                 </ProtectedRoute>
//               } />
              
//               {/* 404 Route */}
//               <Route path="*" element={<NotFound />} />
//             </Routes>
//           </main>
//           <ToastContainer 
//             position="bottom-right"
//             autoClose={3000}
//             hideProgressBar={false}
//             newestOnTop={false}
//             closeOnClick
//             rtl={false}
//             pauseOnFocusLoss
//             draggable
//             pauseOnHover
//           />
//         </div>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;
// src/App.jsx - UPDATED VERSION
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CarList from './pages/CarList';
import CarDetail from './pages/CarDetail'; // 👈 ADD THIS IMPORT
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/cars" element={<CarList />} />
              <Route path="/cars/:id" element={<CarDetail />} /> {/* 👈 ADD THIS ROUTE */}
              
              {/* Protected Routes */}
              <Route path="/booking" element={
                <ProtectedRoute>
                  <Booking />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              <Route path="/my-bookings" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* Admin Only Routes */}
              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <ToastContainer 
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;