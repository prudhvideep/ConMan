import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { RiSunLine, RiMoonLine } from "react-icons/ri";
import useThemeStore from "../store/themeStore";

function PasswordReset() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { theme, setTheme } = useThemeStore();

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
      setError("");
    } catch (error: any) {
      const errorCode = error.code;

      switch (errorCode) {
        case "auth/invalid-email":
          setError("This email address is invalid.");
          break;
        case "auth/user-not-found":
          setError("This email address is not registered.");
          break;
        default:
          setError("Failed to send password reset email. Please try again.");
          break;
      }

      setMessage("");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 ${
      theme === "dark" ? "bg-sidebar" : "bg-gray-100"
    }`}>
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          {theme === "dark" ? (
            <RiSunLine className="h-5 w-5" />
          ) : (
            <RiMoonLine className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className={`mt-6 text-center text-3xl font-extrabold ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}>
          Reset your password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`py-8 px-4 shadow rounded-lg sm:rounded-lg sm:px-10 ${
          theme === "dark" ? "bg-notearea" : "bg-white"
        }`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {message && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
                {message}
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium ${
                  theme === "dark" ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`mt-1 block w-full rounded-md border-0 py-1.5 pl-2.5 shadow-sm ring-1 ring-inset focus:ring-2 outline-none  focus:ring-[#8860a9] sm:text-sm sm:leading-6 ${
                  theme === "dark"
                    ? "bg-sidebar text-white ring-gray-600 placeholder:text-gray-400"
                    : "bg-white text-gray-900 ring-gray-300 placeholder:text-gray-400"
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-[#6d4d88] px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-[#8860a9]"
              >
                Send Password Reset Email
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                }`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${
                  theme === "dark" ? "bg-notearea text-gray-400" : "bg-white text-gray-500"
                }`}>
                  Remember your password?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/"
                className="flex w-full justify-center rounded-md bg-[#6d4d88] px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-[#8860a9]"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PasswordReset;