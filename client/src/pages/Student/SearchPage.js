import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // To get token for API calls
import { searchUsersAPI, getSuggestedUsersAPI } from '../../services/userService'; // Import the new service and getSuggestedUsersAPI
import { checkBulkConnectionStatusAPI } from '../../services/connectionService'; // Import the new bulk status checker
import UserCard from '../../components/UserCard/UserCard'; // Import UserCard
import LoadingState from '../../components/LoadingState';
import './SearchPage.css'; // Create and import a CSS file for styling

const SearchPage = () => {
  const { token } = useAuth(); // Get token for authenticated API calls
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('name'); // 'name' or 'rollNumber'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false); // To track if a search has been performed

  // State for suggested users
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [suggestedLoading, setSuggestedLoading] = useState(true);
  const [suggestedError, setSuggestedError] = useState('');

  // New state to hold the map of connection statuses { userId: boolean }
  const [connectionStatuses, setConnectionStatuses] = useState({});

  useEffect(() => {
    const fetchSuggested = async () => {
      if (!token) {
        setSuggestedError('Authentication token not found.');
        setSuggestedLoading(false);
        return;
      }
      try {
        setSuggestedLoading(true);
        const data = await getSuggestedUsersAPI(token);
        setSuggestedUsers(data);
        setSuggestedError('');
      } catch (err) {
        console.error('Error fetching suggested users:', err);
        setSuggestedError(err.message || 'Failed to fetch suggested users.');
        setSuggestedUsers([]);
      } finally {
        setSuggestedLoading(false);
      }
    };

    fetchSuggested();
  }, [token]);

  // New useEffect to fetch bulk connection statuses whenever user lists change
  useEffect(() => {
    const allUserIds = [
      ...results.map(u => u._id),
      ...suggestedUsers.map(u => u._id)
    ];
    
    // Remove duplicates and empty values
    const uniqueUserIds = [...new Set(allUserIds.filter(id => id))];

    if (uniqueUserIds.length > 0 && token) {
      const fetchStatuses = async () => {
        try {
          const statusMap = await checkBulkConnectionStatusAPI(uniqueUserIds, token);
          setConnectionStatuses(prevStatuses => ({ ...prevStatuses, ...statusMap }));
        } catch (err) {
          console.error('Failed to fetch bulk connection statuses:', err);
        }
      };
      fetchStatuses();
    }
  }, [results, suggestedUsers, token]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setError('Please enter a search term.');
      setResults([]);
      setSearched(false);
      return;
    }
    if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
    }
    setLoading(true);
    setError('');
    setResults([]); // Clear previous results before new search
    setSearched(true);

    try {
      const data = await searchUsersAPI({ query: searchTerm, type: searchType }, token);
      setResults(data);
    } catch (err) {
      console.error('Error searching users:', err);
      setError(err.message || 'Failed to fetch search results.');
      setResults([]); // Ensure results are cleared on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page-container"> {/* Renamed class for clarity */}
      <h2 className="search-header">Search Students</h2>
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input 
            type="text" 
            placeholder={`Enter student ${searchType === 'name' ? 'name' : 'roll number'}...`}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (searched) setSearched(false);
              if (results.length > 0) setResults([]);
              if (error) setError('');
            }}
            className="search-input"
          />
          <select 
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="search-type-select"
          >
            <option value="name">Name</option>
            <option value="rollNumber">Roll Number</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="search-button">
          {loading ? <LoadingState inline message="Searching..." /> : 'Search'}
        </button>
      </form>

      {error && <p className="search-error-message">{error}</p>}

      {loading && <LoadingState message="Searching..." />}

      {/* Main Search Results Display Block */}
      {!loading && searched && (
        <div className="search-results-grid">
          {results.length > 0 ? (
            results.map(user => (
              <UserCard 
                key={user._id} 
                user={user} 
                isInitiallyConnected={connectionStatuses[user._id] || false}
              />
            ))
          ) : (
            !error && <p className="no-results-found-message">No students found matching your criteria.</p>
          )}
        </div>
      )}
      {/* Fallback for initial state */}
      {!loading && !searched && !error && (
        <p className="search-prompt-message">Enter a name or roll number and click search to find students.</p>
      )}

      {/* Suggested Members Section */}
      {suggestedLoading && (
        <LoadingState message="Loading Suggestions..." />
      )}
      {suggestedError && (
        <p className="suggested-error">Error: {suggestedError}</p>
      )}
      {!suggestedLoading && !suggestedError && suggestedUsers.length > 0 && (
        <section className="suggested-members-section">
          <h3 className="suggested-members-header">Suggested Members</h3>
          <div className="suggested-members-grid">
            {suggestedUsers.map(user => (
              <UserCard 
                key={`sugg-${user._id}`} 
                user={user} 
                isInitiallyConnected={connectionStatuses[user._id] || false}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchPage; 