import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    school: '',
    institute: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/signup/', JSON.stringify(formData), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Signup successful:', response.data);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      if (error.response && error.response.status === 500) {
        console.log('User already registered, redirecting to dashboard.');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        console.error('Signup failed:', error);
      }
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-center mb-8">
        School Management System
      </h1>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="school">
              School
            </label>
            <input
              type="text"
              id="school"
              name="school"
              value={formData.school}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your school"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="institute">
              Institute
            </label>
            <select
              id="institute"
              name="institute"
              value={formData.institute}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">Select your institute</option>
              <option value="Pre-Primary Schools (Nurseries/Kindergartens)">Pre-Primary Schools (Nurseries/Kindergartens)</option>
              <option value="Primary Schools">Primary Schools</option>
              <option value="Secondary Schools (O-Level and A-Level)">Secondary Schools (O-Level and A-Level)</option>
              <option value="Universities">Universities</option>
              <option value="Technical/Vocational Schools">Technical/Vocational Schools</option>
              <option value="Teacher Training Colleges">Teacher Training Colleges</option>
              <option value="Nursing/Midwifery Training Schools">Nursing/Midwifery Training Schools</option>
              <option value="Agricultural Institutes">Agricultural Institutes</option>
              <option value="Specialized Institutes">Specialized Institutes</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your password"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
      <Link to="/login" className="text-blue-500 hover:text-blue-700 mt-4">
        Login if you already have an account
      </Link>
    </div>
  );
};

export default SignUp;