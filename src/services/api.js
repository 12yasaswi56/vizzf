// import axios from "axios";

// export const loginUser = async (credentials) => {
//   try {
//     const res = await axios.post("http://localhost:5000/api/auth/login", credentials);
//     return res;
//   } catch (error) {
//     console.error("API Login Error:", error.response ? error.response.data : error.message);
//     throw error;
//   }
// };

// export const signupUser = async (userData) => {
//   try {
//     const res = await axios.post("http://localhost:5000/api/auth/signup", userData);
//     return res;
//   } catch (error) {
//     console.error("API Signup Error:", error.response ? error.response.data : error.message);
//     throw error;
//   }
// };




import axios from "axios";

const API_URL = "https://social-backend-1-qi8q.onrender.com/api/auth"; // Adjust based on backend config

export const loginUser = async (credentials) => {
  try {
    console.log("📤 Sending Login Request:", credentials);
    const res = await axios.post(`${API_URL}/login`, credentials);
    console.log("✅ API Login Success:", res.data);
    return res;
  } catch (error) {
    console.error("❌ API Login Error:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const signupUser = async (userData) => {
  try {
    console.log("📤 Sending Signup Request:", userData);
    const res = await axios.post(`${API_URL}/signup`, userData);
    console.log("✅ API Signup Success:", res.data);
    return res;
  } catch (error) {
    console.error("❌ API Signup Error:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const testBcrypt = async (testData) => {
  try {
    console.log("📤 Testing bcrypt with:", testData);
    const res = await axios.post(`${API_URL}/test-bcrypt`, testData);
    console.log("✅ bcrypt test success:", res.data);
    return res;
  } catch (error) {
    console.error("❌ bcrypt test error:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Debug function to test a specific user's password
export const debugUserPassword = async (data) => {
  try {
    console.log("📤 Debug user password:", data);
    const res = await axios.post(`${API_URL}/debug-user-password`, data);
    console.log("✅ Debug result:", res.data);
    return res;
  } catch (error) {
    console.error("❌ Debug error:", error.response ? error.response.data : error.message);
    throw error;
  }
};