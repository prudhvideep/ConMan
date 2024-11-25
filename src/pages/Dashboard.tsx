import { useEffect, useState } from "react";
import {
  RiSearchLine,
  RiBookOpenLine,
  RiStarLine,
  RiSunLine,
  RiMoonLine,
  RiFolderOpenLine,
  RiLogoutBoxRLine,
  RiCloseLine,
} from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import useThemeStore from "../store/themeStore";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import useUserStore from "../store/userStore";

const Dashboard = (): JSX.Element => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [_, setImportantBooks] = useState<any[]>([]);

  const { theme, setTheme } = useThemeStore();
  const { userName } = useUserStore();
  const [showModal, setShowModal] = useState(false);

  // Temporary book data
  const temporaryBooks = [
    { id: 1, book_title: "The Great Gatsby", isImportant: true },
    { id: 2, book_title: "To Kill a Mockingbird", isImportant: false },
    { id: 3, book_title: "1984", isImportant: true },
    { id: 4, book_title: "Pride and Prejudice", isImportant: false },
  ];

  const popularResources = [
    {
      id: 2,
      name: "Academic Search Ultimate",
      link: "https://www.ebscohost.com/academic/academic-search-ultimate",
    },
    {
      id: 4,
      name: "ProQuest Dissertations & Theses Global",
      link: "https://www.proquest.com/products-services/pqdtglobal.html",
    },
    {
      id: 7,
      name: "Google Scholar (with library links)",
      link: "https://scholar.google.com/",
    },
    { id: 8, name: "JSTOR", link: "https://www.jstor.org/" },
    {
      id: 9,
      name: "Nexis Uni",
      link: "https://legal.thomsonreuters.com/en/westlaw",
    },
    {
      id: 10,
      name: "Opposing Viewpoints",
      link: "https://www.gale.com/c/opposing-viewpoints",
    },
    {
      id: 11,
      name: "PsycInfo",
      link: "https://www.apa.org/pubs/databases/psycinfo",
    },
    { id: 12, name: "PubMed", link: "https://pubmed.ncbi.nlm.nih.gov/" },
    { id: 13, name: "Scopus", link: "https://www.scopus.com/" },
    { id: 14, name: "Worldcat", link: "https://www.worldcat.org/" },
  ];

  useEffect(() => {
    setBooks(temporaryBooks);
    setResources(popularResources);
    const importantBooks = temporaryBooks.filter((book) => book.isImportant);
    setImportantBooks(importantBooks);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-sidebar" : "bg-gray-100"
      }`}
    >
      <header
        className={`border-b ${
          theme === "dark" ? "border-gray-500" : "border-gray-200"
        } ${theme === "dark" ? "bg-sidebar" : "bg-white"}`}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1
            className={`text-2xl font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-800"
            }`}
          >
            Library Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                readOnly={true}
                placeholder="Search books..."
                onClick={() => setShowModal(true)}
                className={`pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8860a9] ${
                  theme === "dark"
                    ? "bg-notearea border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                }`}
              />
            </div>
            {/* <button className="flex items-center gap-2 bg-[#6d4d88] text-white px-4 py-2 rounded-lg hover:bg-[#8860a9]">
              <RiAddLine className="h-5 w-5" />
              New Book
            </button> */}
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
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 ${
                theme === "dark" ? "text-white" : "text-gray-800"
              }`}
            >
              <RiLogoutBoxRLine className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div
          className={`rounded-lg border p-6 mb-6 ${
            theme === "dark"
              ? "bg-notearea border-gray-500"
              : "bg-white border-gray-200"
          }`}
        >
          <h2
            className={`text-xl font-medium ${
              theme === "dark" ? "text-white" : "text-gray-800"
            }`}
          >
            Good {getTimeOfDay()}, {userName}!
          </h2>
          <p
            className={`mt-1 ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Welcome back to your library. Here's what's happening today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Books Section */}
          <div className="lg:col-span-1">
            <div
              className={`rounded-lg border p-6 h-[500px] flex flex-col ${
                theme === "dark"
                  ? "bg-notearea border-gray-500"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className={`text-lg font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}
                >
                  Your Books
                </h2>
                <button
                  onClick={() => navigate("/books")}
                  className="text-[#a474ca] hover:text-[#8860a9] text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3 overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {books.map((book) => (
                  <div
                    key={book.id}
                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                      theme === "dark"
                        ? "hover:bg-sidebar text-white"
                        : "hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RiBookOpenLine className="h-5 w-5 text-[#a474ca]" />
                      <div>
                        <p className="font-medium">{book.book_title}</p>
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          0 files
                        </p>
                      </div>
                    </div>
                    <button
                      className={`${
                        theme === "dark"
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-500 hover:text-gray-600"
                      }`}
                    >
                      <RiStarLine className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resources Section */}
          <div className="lg:col-span-2">
            <div
              className={`rounded-lg border p-6 h-[500px] flex flex-col ${
                theme === "dark"
                  ? "bg-notearea border-gray-500"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className={`text-lg font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}
                >
                  View Resources
                </h2>
              </div>
              <div className="space-y-3 overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                      theme === "dark" ? "hover:bg-sidebar" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RiFolderOpenLine className="h-5 w-5 text-[#a474ca]" />
                      <div>
                        <p
                          className={`font-medium ${
                            theme === "dark" ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {resource.name}
                        </p>
                      </div>
                    </div>
                    <a
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#a474ca] hover:text-[#8860a9] text-sm"
                    >
                      Access
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-sidebar border dark:border-gray-500 rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium dark:text-white text-gray-800">
                Advanced Search
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
              >
                <RiCloseLine className="h-5 w-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-6">
              <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search books, authors, or tags..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-notearea dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            {/* Filters Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-600">
                  Category
                </label>
                <select className="mt-2 w-full border rounded-lg px-4 py-2 dark:bg-notearea dark:border-gray-600 dark:text-white">
                  <option>All</option>
                  <option>Fiction</option>
                  <option>Non-Fiction</option>
                  <option>Science</option>
                  <option>History</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-600">
                  Sort By
                </label>
                <select className="mt-2 w-full border rounded-lg px-4 py-2 dark:bg-notearea dark:border-gray-600 dark:text-white">
                  <option>Relevance</option>
                  <option>Most Popular</option>
                  <option>Newest</option>
                  <option>Oldest</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-600">
                  Tags (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., thriller, classic"
                  className="mt-2 w-full border rounded-lg px-4 py-2 dark:bg-notearea dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-600 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle search logic here
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
