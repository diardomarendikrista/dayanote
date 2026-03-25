import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "../utils/cn";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:4015"}/api/auth/register`,
        { name, email, password },
      );
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0a09] p-4 relative overflow-hidden font-['Inter']">
      {/* Background Orbs with Brand Colors */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#a81c1c]/10 rounded-full blur-[150px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#a81c1c]/5 rounded-full blur-[150px] animate-pulse delay-1000"></div>

      <div className="w-full max-w-md p-12 glass rounded-[2.5rem] shadow-2xl relative z-10 border border-white/5">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#a81c1c] rounded-2xl rotate-45 flex items-center justify-center shadow-2xl shadow-[#a81c1c]/20">
              <span className="text-white text-3xl font-black -rotate-45">
                D
              </span>
            </div>
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter text-white">
            DAYA<span className="text-[#a81c1c]">NOTE</span>
          </h1>
          <p className="text-stone-500 font-medium text-sm tracking-widest uppercase">
            Start your collaborative journey
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-3 font-['Outfit']">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-stone-400 ml-1 font-['Outfit']">
              Owner Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="w-full p-4 rounded-2xl border border-stone-700 bg-stone-900 text-white placeholder:text-stone-500 focus:ring-1 focus:ring-[#a81c1c] focus:border-[#a81c1c] outline-none transition-all text-sm font-medium shadow-inner"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-stone-400 ml-1 font-['Outfit']">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@example.com"
              className="w-full p-4 rounded-2xl border border-stone-700 bg-stone-900 text-white placeholder:text-stone-500 focus:ring-1 focus:ring-[#a81c1c] focus:border-[#a81c1c] outline-none transition-all text-sm font-medium shadow-inner"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-stone-400 ml-1 font-['Outfit']">
              Secure Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full p-4 rounded-2xl border border-stone-700 bg-stone-900 text-white placeholder:text-stone-500 focus:ring-1 focus:ring-[#a81c1c] focus:border-[#a81c1c] outline-none transition-all text-sm font-medium shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-[#a81c1c] hover:bg-[#991b1b] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#a81c1c]/30 active:scale-[0.98] transition-all mt-4"
          >
            Create Account
          </button>
        </form>

        <p className="mt-10 text-center text-[11px] font-black uppercase tracking-[0.2em] text-stone-600 font-['Outfit']">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#a81c1c] hover:text-white transition-colors ml-1"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
