import React from "react";

function Login() {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <form className="flex flex-col gap-4">
        <input type="text" placeholder="Username" className="border p-2 rounded" />
        <input type="password" placeholder="Password" className="border p-2 rounded" />
        <button type="submit" className="bg-blue-700 text-white py-2 rounded">Login</button>
      </form>
    </div>
  );
}

export default Login;
