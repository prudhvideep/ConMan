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
import { PiSpinnerBold } from "react-icons/pi";

interface book {
  author: string[];
  date: string;
  genre: string;
  id: string;
  isbn: string;
  publisher: string;
  score: number;
  search_times: number;
  summary: string;
  title: string;
}

interface filter {
  author: string;
  title: string;
  genre: string;
  isbn: string;
  publisher: string;
}

const Dashboard = (): JSX.Element => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<book[]>([]);
  const [resources, setResources] = useState<any[]>([]);

  const { theme, setTheme } = useThemeStore();
  const { userName, setUserName, email, setEmail } = useUserStore();
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState<string>("");
  const [filter, setFilter] = useState<filter>({
    author: "",
    title: "",
    genre: "",
    isbn: "",
    publisher: "",
  });
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [searchType, setSearchType] = useState("semantic");
  const [searchResults, setSearchResults] = useState<book[]>([]);
  const [selectedBook, setSelectedBook] = useState<book | null>();
  const [showBookModal, setShowBookModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<book[]>([]);
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
  ];

  useEffect(() => {
    setResources(popularResources);

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const userName = user.displayName || "Anonymous User";
        const email = user.email;
        setUserName(userName);
        setEmail(email);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    async function fetchPopularBooks() {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/elasticsearch/popular`
      );

      if (!response.ok) {
        console.error("Error fetching popular books");
        return;
      }

      const resonseObj = await response.json();

      if (resonseObj.data) {
        setBooks(resonseObj.data);
      }
    }

    fetchPopularBooks();
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

  const handleSearchInputChange = async (query: string) => {
    setSearching(true);

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_BASE_URL
        }/elasticsearch/summary?query="${query}"`
      );

      if (!response.ok) {
        alert("Error fetching the responce ---> ");
      }

      const resp = await response.json();

      console.log("Responce ----> ", resp.data);

      if (resp.data) {
        setSearching(false);
        setShowResults(true);
        setSearchResults(resp.data);
      }
    } catch (error) {
      setSearching(false);
      setShowResults(false);
      setSearchResults([]);
      alert("Error performing the search");
    }
  };

  async function handleFacetedSearch(filter: filter) {
    setSearching(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/elasticsearch/filter?author=${
          filter.author
        }&title=${filter.title}&genere=${filter.genre}&isbn=${
          filter.isbn
        }&publisher=${filter.publisher}`
      );

      if (!response.ok) {
        alert("Error fetching the responce ---> ");
      }

      const resp = await response.json();

      console.log("Responce ----> ", resp.data);

      if (resp.data) {
        setSearching(false);
        setShowResults(true);

        if (Array.isArray(resp.data)) {
          setSearchResults(resp.data);
        } else {
          setSearchResults([]);
        }
      }
    } catch (error) {
      setSearching(false);
      setShowResults(false);
      setSearchResults([]);
      alert("Error performing the search");
    }
  }

  function handleBookSelection(book: book) {
    console.log("Book selected ---> ", book);
    setShowModal(false);
    clearSearchResults();
    setSelectedBook(book);
    setShowBookModal(true);

    buildHistory(book);
  }

  function handleSuggestionSelection(book: book) {
    console.log("Book selected ---> ", book);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedBook(book);
    setShowBookModal(true);

    buildHistory(book);
  }

  async function buildHistory(selectedBook: book) {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        read: [selectedBook.id],
      }),
    });

    if (!response.ok) {
      console.error("Error fetching the results ", response.status);
      return;
    }
  }

  function clearSearchResults() {
    setQuery("");
    setSearching(false);
    setShowResults(false);
    setSearchResults([]);
  }

  async function handleFetchSuggestions() {
    console.log("Calling fetch suggestions");
    setShowSuggestions(true);

    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/elasticsearch/customize`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      }
    );

    if (!response.ok) {
      alert("Error fetching suggestions");
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }

    const respObj = await response.json();
    if (respObj.data) {
      setSuggestions(respObj.data);
    }
  }

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-sidebar" : "bg-gray-100"
      }`}
    >
      <header
        className={`w-full border-b ${
          theme === "dark"
            ? "bg-sidebar border-gray-500"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-center md:justify-between items-center">
            <div className="hidden md:flex flex-row justify-start items-center gap-4 ">
              <h1
                className={`text-2xl font-semibold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Library One
              </h1>
            </div>

            <div className="w-full md:w-auto flex justify-around items-center  md:gap-4">
              <div className="relative">
                <RiSearchLine
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="text"
                  readOnly={true}
                  onClick={() => setShowModal(true)}
                  placeholder="Search books..."
                  className={`w-40 md:w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8860a9] ${
                    theme === "dark"
                      ? "bg-notearea border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                />
              </div>
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
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div
          className={`rounded-lg border p-6 mb-6 ${
            theme === "dark"
              ? "bg-notearea border-gray-500"
              : "bg-white border-gray-200"
          } flex justify-between`}
        >
          <div>
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
              Welcome back to your library.
            </p>
          </div>
          <div>
            <button
              onClick={() => {
                handleFetchSuggestions();
              }}
              className={` p-2 pl-2 pr-2 rounded-md ${
                theme === "dark"
                  ? "bg-[#8860a9] text-slate-200 hover:text-slate-100"
                  : "text-gray-800 bg-[#a474ca]"
              }  hover:scale-105`}
            >
              Suggest Titles
            </button>
          </div>
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
                  Popular Books
                </h2>
                {/* <button
                  onClick={() => navigate("/books")}
                  className="text-[#a474ca] hover:text-[#8860a9] text-sm font-medium"
                >
                  View All
                </button> */}
              </div>
              <div className="space-y-3 overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {books.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => {
                      setSelectedBook(book);
                      setShowBookModal(true);
                    }}
                    className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                      theme === "dark"
                        ? "hover:bg-sidebar text-white"
                        : "hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <RiBookOpenLine className="h-5 w-5 text-[#a474ca]" />
                      <div>
                        <p className="font-medium">{book.title}</p>
                        <p
                          className={`text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Search Count - {book.search_times}
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
        <div className="transition-all ease-in-out duration-500 fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-scroll">
          <div
            className={`max-w-2xl mt-10 w-9/10 md:w-full border dark:border-gray-500 rounded-lg p-6 
             ${
               theme === "dark"
                 ? "bg-notearea border-gray-500"
                 : "bg-white border-gray-200"
             }`}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-row justify-normal items-center gap-4">
                <h2
                  className={`text-lg font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}
                >
                  {searchType === "semantic"
                    ? "Semantic Search"
                    : "Faceted Search"}
                </h2>
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={searchType === "semantic"}
                      onClick={() => {
                        clearSearchResults();
                      }}
                      onChange={(e) =>
                        setSearchType(e.target.checked ? "semantic" : "faceted")
                      }
                      className="sr-only peer"
                    />
                    <div
                      className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#8860a9] 
      rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full 
      peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
      after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
      after:transition-all dark:border-gray-600 peer-checked:bg-[#8860a9]`}
                    ></div>
                  </label>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className={`${
                  theme === "dark"
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <RiCloseLine
                  className={`text-2xl`}
                  onClick={() => {
                    clearSearchResults();
                  }}
                />
              </button>
            </div>

            {/* Search Input */}
            {searchType === "semantic" && (
              <div className="relative mb-6">
                {searching ? (
                  <PiSpinnerBold className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8860a9] h-5 w-5 animate-pulse text-xl font-bold" />
                ) : (
                  <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                )}
                <input
                  type="text"
                  value={query}
                  readOnly={searching}
                  onChange={(e: any) => setQuery(e.target.value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      // Call your search function here
                      if (query.trim() === "") {
                        setShowResults(false);
                        setSearchResults([]);
                        return;
                      }

                      handleSearchInputChange(query);
                    }
                  }}
                  placeholder={`Initiate ${
                    searchType === "semantic" ? "Semantic" : "Faceted"
                  } Search: Press Enter to Begin`}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    searching ? "focus:ring-[#8860a9]" : "focus:ring-gray-400"
                  } ${
                    theme === "dark"
                      ? "bg-zinc-800 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
                  }`}
                />
              </div>
            )}

            {searchType !== "semantic" && (
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Author */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Author
                    </label>
                    <input
                      type="text"
                      value={filter.author}
                      onChange={(e) =>
                        setFilter((prev) => ({
                          ...prev,
                          author: e.target.value,
                        }))
                      }
                      placeholder="Enter author name"
                      className={`w-full mt-2 pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        theme === "dark"
                          ? "bg-zinc-800 border-gray-600 text-white placeholder-gray-400 focus:ring-[#8860a9]"
                          : "bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-gray-400"
                      }`}
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter title"
                      value={filter.title}
                      onChange={(e) =>
                        setFilter((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className={`w-full mt-2 pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        theme === "dark"
                          ? "bg-zinc-800 border-gray-600 text-white placeholder-gray-400 focus:ring-[#8860a9]"
                          : "bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-gray-400"
                      }`}
                    />
                  </div>

                  {/* Genre */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Genre
                    </label>
                    <input
                      type="text"
                      placeholder="Enter genre"
                      value={filter.genre}
                      onChange={(e) =>
                        setFilter((prev) => ({
                          ...prev,
                          genre: e.target.value,
                        }))
                      }
                      className={`w-full mt-2 pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        theme === "dark"
                          ? "bg-zinc-800 border-gray-600 text-white placeholder-gray-400 focus:ring-[#8860a9]"
                          : "bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-gray-400"
                      }`}
                    />
                  </div>

                  {/* ISBN */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      ISBN
                    </label>
                    <input
                      type="text"
                      placeholder="Enter ISBN"
                      value={filter.isbn}
                      onChange={(e) =>
                        setFilter((prev) => ({ ...prev, isbn: e.target.value }))
                      }
                      className={`w-full mt-2 pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        theme === "dark"
                          ? "bg-zinc-800 border-gray-600 text-white placeholder-gray-400 focus:ring-[#8860a9]"
                          : "bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-gray-400"
                      }`}
                    />
                  </div>

                  {/* Publisher */}
                  <div>
                    <label
                      className={`block text-sm font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Publisher
                    </label>
                    <input
                      type="text"
                      placeholder="Enter publisher"
                      value={filter.publisher}
                      onChange={(e) =>
                        setFilter((prev) => ({
                          ...prev,
                          publisher: e.target.value,
                        }))
                      }
                      className={`w-full mt-2 pl-4 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        theme === "dark"
                          ? "bg-zinc-800 border-gray-600 text-white placeholder-gray-400 focus:ring-[#8860a9]"
                          : "bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-gray-400"
                      }`}
                    />
                  </div>
                </div>
                {/* Apply Filters Button */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleFacetedSearch(filter)}
                    className="bg-[#8860a9] hover:bg-[#724d90] text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                  >
                    {searching ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>
            )}

            {showResults && (
              <div className="max-h-lg mt-4 flex flex-col gap-2">
                <p
                  className={`mt-2 mb-2 text-xl  ${
                    theme === "dark" ? "text-gray-300" : "text-gray-800"
                  }`}
                >
                  Search Results
                </p>
                {Array.isArray(searchResults) &&
                  searchResults.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => handleBookSelection(book)}
                      className={` ${
                        theme === "dark" ? "bg-zinc-800" : "bg-zinc-200"
                      } shadow-sm hover:cursor-pointer hover:border-[#8860a9] hover:border mt-2 rounded-md p-4 w-full hover:scale-105 transition-all ease-in-out delay-75 duration-500`}
                    >
                      <div className="flex felx-row justify-between">
                        <div className="flex flex-col">
                          <p
                            className={`text-xl ${
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-gray-800"
                            } `}
                          >
                            {book.title}
                          </p>

                          <p
                            className={`text-md ${
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-gray-800"
                            }`}
                          >
                            {book.author.join(",")}
                          </p>
                        </div>
                        <div>
                          <p
                            className={`text-md ${
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-gray-800"
                            }`}
                          >
                            Score :{" "}
                            <span className="text-[#a474ca]">
                              {book.score.toPrecision(2)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
      {showBookModal && (
        <div className="transition-all ease-in-out duration-500 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div
            className={`border max-w-2xl w-full rounded-lg p-6 max-h-[90vh] overflow-y-auto ${
              theme === "dark"
                ? "bg-notearea border-gray-500 text-white"
                : "bg-white border-gray-200 text-gray-800"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <RiBookOpenLine className="h-6 w-6 text-[#a474ca]" />
                <h2 className="text-xl font-semibold">{selectedBook?.title}</h2>
              </div>
              <button
                onClick={() => {
                  setSelectedBook(null);
                  setShowBookModal(false);
                }}
                className={`${
                  theme === "dark"
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <RiCloseLine className="text-2xl" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Book Details</h3>
                  <div
                    className={`p-4 rounded-lg ${
                      theme === "dark" ? "bg-sidebar" : "bg-gray-50"
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            theme === "dark" ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          Author
                        </p>
                        <p>{selectedBook?.author.join(", ")}</p>
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            theme === "dark" ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          Genre
                        </p>
                        <p>{selectedBook?.genre}</p>
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            theme === "dark" ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          ISBN
                        </p>
                        <p>{selectedBook?.isbn}</p>
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            theme === "dark" ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          Publisher
                        </p>
                        <p>{selectedBook?.publisher}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Summary</h3>
                  <p
                    className={`${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {selectedBook?.summary}
                  </p>
                </div>
              </div>

              <div className="md:col-span-1 flex flex-col items-start">
                <div
                  className={`w-full p-4 rounded-lg text-center ${
                    theme === "dark" ? "bg-sidebar" : "bg-gray-50"
                  }`}
                >
                  <div className="flex justify-center items-center mb-3">
                    <RiStarLine className="h-6 w-6 text-[#a474ca] mr-2" />
                    <span className="text-2xl font-bold text-[#a474ca]">
                      {selectedBook?.score?.toFixed(2)}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Publication Date: <br /> {selectedBook?.date}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showSuggestions && (
        <div className="transition-all ease-in-out duration-500 fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-scroll">
          <div
            className={`max-w-2xl mt-10 w-9/10 md:w-full border dark:border-gray-500 rounded-lg p-6 
             ${
               theme === "dark"
                 ? "bg-notearea border-gray-500"
                 : "bg-white border-gray-200"
             }`}
          >
            {
              <div className="max-h-lg flex flex-col gap-2">
                <div className="flex flex-row justify-between items-center">
                  <p
                    className={`mt-2 mb-2 text-xl  ${
                      theme === "dark" ? "text-gray-300" : "text-gray-800"
                    }`}
                  >
                    {suggestions.length === 0 ? (
                      <span className="text-[#a474ca] animate-pulse">
                        Fetching suggestions
                      </span>
                    ) : (
                      "Suggestions"
                    )}
                  </p>
                  <button
                    onClick={() => setShowModal(false)}
                    className={`${
                      theme === "dark"
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-600 hover:text-gray-800"
                    } flex items-end`}
                  >
                    <RiCloseLine
                      className={`text-2xl`}
                      onClick={() => {
                        setSuggestions([])
                        setShowSuggestions(false);
                      }}
                    />
                  </button>
                </div>

                {Array.isArray(suggestions) &&
                  suggestions.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => handleSuggestionSelection(book)}
                      className={` ${
                        theme === "dark" ? "bg-zinc-800" : "bg-zinc-200"
                      } shadow-sm hover:cursor-pointer hover:border-[#8860a9] hover:border mt-2 rounded-md p-4 w-full hover:scale-105 transition-all ease-in-out delay-75 duration-500`}
                    >
                      <div className="flex felx-row justify-between">
                        <div className="flex flex-col">
                          <p
                            className={`text-xl ${
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-gray-800"
                            } `}
                          >
                            {book.title}
                          </p>

                          <p
                            className={`text-md ${
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-gray-800"
                            }`}
                          >
                            {book.author.join(",")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
