import { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { RiSunLine, RiMoonLine } from "react-icons/ri";
import useThemeStore from "../store/themeStore";
import useUserStore from "../store/userStore";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { theme, setTheme } = useThemeStore();

  const {setUserName} = useUserStore();

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const userName = user.displayName || "Anonymous User"; 
        setUserName(userName); 
        navigate("/dashboard");
      }
    });

    return unsubscribe;
  }, [navigate]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    console.log("Inside handle submit");

    if (!email || !password) return;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error: any) {
      const errorCode = error.code;
      setError(true);
      console.log("Error code ----> ", errorCode);

      switch (errorCode) {
        case "auth/invalid-email":
          setErrorMessage("This email address is invalid.");
          break;
        case "auth/user-disabled":
          setErrorMessage("This email address is disabled by the administrator.");
          break;
        case "auth/user-not-found":
          setErrorMessage("This email address is not registered.");
          break;
        case "auth/wrong-password":
          setErrorMessage(
            "The password is invalid or the user does not have a password."
          );
          break;
        case "auth/invalid-credential":
          setErrorMessage("The email or password combination is invalid.");
          break;
        default:
          setErrorMessage(error.message);
          break;
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("Result ----> ", result);
      const userName = result.user.displayName;
      console.log("User Name ----> ", userName);
      navigate("/dashboard");
    } catch (error: any) {
      const errorCode = error.code;
      setError(true);
      console.log("Error code ----> ", errorCode);

      switch (errorCode) {
        case "auth/popup-closed-by-user":
          setErrorMessage("Popup closed by the user.");
          break;
        case "auth/cancelled-popup-request":
          setErrorMessage("Popup Cancelled by the user.");
          break;
        case "auth/user-not-found":
          setErrorMessage("This email address is not registered.");
          break;
        case "auth/wrong-password":
          setErrorMessage(
            "The password is invalid or the user does not have a password."
          );
          break;
        case "auth/invalid-credential":
          setErrorMessage("The email or password combination is invalid.");
          break;
        default:
          setErrorMessage(error.message);
          break;
      }
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

      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className={`mt-6 text-center text-3xl font-extrabold ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}>
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto md:mx-auto sm:w-full sm:max-w-lg md:w-full md:max-w-lg">
        <div className={`py-8 px-4 shadow rounded-lg sm:rounded-lg sm:px-10 ${
          theme === "dark" ? "bg-notearea" : "bg-white"
        }`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium leading-6 ${
                  theme === "dark" ? "text-gray-200" : "text-gray-900"
                }`}
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`block w-full rounded-md border-0 py-1.5 pl-2.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset focus:ring-[#8860a9] sm:text-sm sm:leading-6 ${
                    theme === "dark"
                      ? "bg-sidebar text-white ring-gray-600 placeholder:text-gray-400"
                      : "bg-white text-gray-900 ring-gray-300 placeholder:text-gray-400"
                  }`}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium leading-6 ${
                    theme === "dark" ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  Password
                </label>
                <div className="text-sm">
                  <Link
                    to="/passwordreset"
                    className="font-semibold text-[#a474ca] hover:text-[#8860a9]"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`block w-full rounded-md border-0 py-1.5 pl-2.5 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset focus:ring-[#8860a9] sm:text-sm sm:leading-6 ${
                    theme === "dark"
                      ? "bg-sidebar text-white ring-gray-600 placeholder:text-gray-400"
                      : "bg-white text-gray-900 ring-gray-300 placeholder:text-gray-400"
                  }`}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-[#6d4d88] px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-[#8860a9]"
              >
                Sign in
              </button>
              {error && (
                <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
              )}
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
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className={`inline-flex items-center justify-center w-full max-w-xs rounded-md px-3 py-1.5 text-sm font-semibold leading-6 shadow-sm ring-1 ring-inset ${
                  theme === "dark"
                    ? "bg-sidebar text-white ring-gray-600 hover:bg-opacity-80"
                    : "bg-white text-gray-900 ring-gray-300 hover:bg-gray-50"
                }`}
              >
                <FaGoogle className="w-5 h-5 mr-2" />
                <span>Sign in with Google</span>
              </button>
            </div>
          </div>

          <p className={`mt-10 text-center text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}>
            Not a member?{" "}
            <Link
              to="/signup"
              className="font-semibold text-[#a474ca] hover:text-[#8860a9]"
            >
              Create New Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;