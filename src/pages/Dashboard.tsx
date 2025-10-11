import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Grid, List, Clock, CheckCircle, Archive, MoreVertical, Edit3, Trash2, Save, X, AlertTriangle, ArrowRight, MessageCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient.js';
import { useAuth } from '../contexts/AuthContext';
import ThoughtInput from '../components/ThoughtInput';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import ProtectedRoute from '../components/ProtectedRoute';

interface Thought {
  id: string;
  content: string;
  category: string;
  status: 'pending' | 'done' | 'archived' | 'thought';
  created_at: string;
  user_id: string;
}

const CATEGORIES = ['All', 'work', 'shopping', 'idea', 'personal', 'reminder', 'health', 'travel', 'random', 'thoughts'];
const STATUS_OPTIONS = ['All', 'pending', 'done', 'archived', 'thought', 'urgent'];

// Available categories for moving tasks
const MOVE_CATEGORIES = ['work', 'shopping', 'idea', 'personal', 'reminder', 'health', 'travel'];

// Urgency keywords for red shine indicator
const URGENCY_KEYWORDS = [
  'tomorrow', 'tonight', 'asap', 'by evening', 'next hour', 'urgent', 'immediately', 
  'right now', 'today', 'this morning', 'this afternoon', 'deadline', 'due', 'emergency', 'now'
];

const DashboardContent: React.FC = () => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [filteredThoughts, setFilteredThoughts] = useState<Thought[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showThoughtInput, setShowThoughtInput] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [editingThought, setEditingThought] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [showMoveModal, setShowMoveModal] = useState<string | null>(null);
  
  const { toast, showToast, hideToast } = useToast();
  const { user } = useAuth();

  // Check if thought content contains urgency keywords
  const hasUrgency = (content: string): boolean => {
    const lowerContent = content.toLowerCase();
    return URGENCY_KEYWORDS.some(keyword => lowerContent.includes(keyword));
  };

  // Fetch thoughts from Supabase for the authenticated user
  const fetchThoughts = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('thoughts')
        .select('*')
        .eq('user_id', user.id) // Only fetch thoughts for the authenticated user
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setThoughts(data || []);
    } catch (err) {
      console.error('Error fetching thoughts:', err);
      setError('Failed to load thoughts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update thought status
  const updateThoughtStatus = async (id: string, newStatus: 'pending' | 'done' | 'archived') => {
    if (!user) return;

    try {
      setIsUpdating(id);
      const { error } = await supabase
        .from('thoughts')
        .update({ status: newStatus })
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user can only update their own thoughts

      if (error) {
        throw error;
      }

      // Update local state
      setThoughts(prev => 
        prev.map(thought => 
          thought.id === id ? { ...thought, status: newStatus } : thought
        )
      );

      showToast(`Thought marked as ${newStatus}`, 'success');
      setActiveDropdown(null);
    } catch (err) {
      console.error('Error updating thought status:', err);
      showToast('Failed to update thought status', 'error');
    } finally {
      setIsUpdating(null);
    }
  };

  // Move thought to different category
  const moveThoughtToCategory = async (id: string, newCategory: string) => {
    if (!user) return;

    try {
      setIsUpdating(id);
      const { error } = await supabase
        .from('thoughts')
        .update({ category: newCategory })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setThoughts(prev => 
        prev.map(thought => 
          thought.id === id ? { ...thought, category: newCategory } : thought
        )
      );

      showToast(`Thought moved to ${newCategory}`, 'success');
      setShowMoveModal(null);
      setActiveDropdown(null);
    } catch (err) {
      console.error('Error moving thought:', err);
      showToast('Failed to move thought', 'error');
    } finally {
      setIsUpdating(null);
    }
  };

  // Edit thought content
  const startEdit = (thought: Thought) => {
    setEditingThought(thought.id);
    setEditContent(thought.content);
    setActiveDropdown(null);
  };

  const saveEdit = async (id: string) => {
    if (!user || !editContent.trim()) {
      showToast('Thought content cannot be empty', 'error');
      return;
    }

    try {
      setIsUpdating(id);
      const { error } = await supabase
        .from('thoughts')
        .update({ content: editContent.trim() })
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user can only edit their own thoughts

      if (error) {
        throw error;
      }

      // Update local state
      setThoughts(prev => 
        prev.map(thought => 
          thought.id === id ? { ...thought, content: editContent.trim() } : thought
        )
      );

      setEditingThought(null);
      setEditContent('');
      showToast('Thought updated successfully', 'success');
    } catch (err) {
      console.error('Error updating thought:', err);
      showToast('Failed to update thought', 'error');
    } finally {
      setIsUpdating(null);
    }
  };

  const cancelEdit = () => {
    setEditingThought(null);
    setEditContent('');
  };

  // Delete thought
  const deleteThought = async (id: string) => {
    if (!user) return;

    try {
      setIsUpdating(id);
      const { error } = await supabase
        .from('thoughts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user can only delete their own thoughts

      if (error) {
        throw error;
      }

      // Update local state
      setThoughts(prev => prev.filter(thought => thought.id !== id));
      setDeleteConfirm(null);
      showToast('Thought deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting thought:', err);
      showToast('Failed to delete thought', 'error');
    } finally {
      setIsUpdating(null);
    }
  };

  // Get available status options for a thought (excluding current status)
  const getAvailableStatusOptions = (currentStatus: string, category: string) => {
    // For random category, only allow archive
    if (category === 'random') {
      return currentStatus !== 'archived' ? ['archived'] : [];
    }
    
    // For thoughts, only allow archive
    if (currentStatus === 'thought') {
      return ['archived'];
    }
    
    const allStatuses = ['pending', 'done', 'archived'];
    return allStatuses.filter(status => status !== currentStatus);
  };

  // Filter thoughts based on category, status, and search
  useEffect(() => {
    let filtered = thoughts;

    // Filter by category
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'thoughts') {
        // Show thoughts with status 'thought'
        filtered = filtered.filter(thought => thought.status === 'thought');
      } else {
        filtered = filtered.filter(thought => thought.category === selectedCategory);
      }
    }

    // Filter by status (including urgent filter)
    if (selectedStatus !== 'All') {
      if (selectedStatus === 'urgent') {
        // Filter by urgency keywords in content
        filtered = filtered.filter(thought => hasUrgency(thought.content));
      } else {
        filtered = filtered.filter(thought => thought.status === selectedStatus);
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(thought =>
        thought.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredThoughts(filtered);
  }, [thoughts, selectedCategory, selectedStatus, searchTerm]);

  // Load thoughts on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchThoughts();
    }
  }, [user]);

  const handleThoughtSubmit = (thought: string) => {
    console.log('New thought submitted:', thought);
    showToast('Thought dumped successfully!', 'success');
    setShowThoughtInput(false);
    // Refresh thoughts after submission
    fetchThoughts();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
      case 'thought':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'archived':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      case 'thought':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      work: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300',
      shopping: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300',
      idea: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300',
      personal: 'bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-300',
      reminder: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300',
      health: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300',
      travel: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300',
      random: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
    };
    return colors[category] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your thoughts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 dark:text-red-400 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Something went wrong</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchThoughts}
            className="bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Mind Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {thoughts.length} thought{thoughts.length !== 1 ? 's' : ''} captured
            </p>
          </div>
          
          <button
            onClick={() => setShowThoughtInput(!showThoughtInput)}
            className="flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-lavender-500 text-white px-6 py-3 rounded-xl font-medium hover:from-primary-600 hover:to-lavender-600 transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            <span>New Thought</span>
          </button>
        </div>

        {/* Thought Input Modal */}
        {showThoughtInput && (
          <div className="mb-8 animate-slide-up">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Capture a New Thought</h2>
                <button
                  onClick={() => setShowThoughtInput(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 text-2xl"
                >
                  ×
                </button>
              </div>
              <ThoughtInput onSubmit={handleThoughtSubmit} />
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-8 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search thoughts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div className="flex items-center gap-4">
              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category === 'All' ? 'All Categories' : 
                       category === 'thoughts' ? 'Thoughts' :
                       category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status} value={status}>
                      {status === 'All' ? 'All Status' : 
                       status === 'urgent' ? 'Urgent' :
                       status === 'thought' ? 'Thoughts' :
                       status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-primary-500 text-white' 
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-primary-500 text-white' 
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            {filteredThoughts.length} thought{filteredThoughts.length !== 1 ? 's' : ''} found
            {selectedCategory !== 'All' && ` in ${selectedCategory === 'thoughts' ? 'Thoughts' : selectedCategory}`}
            {selectedStatus !== 'All' && ` with ${selectedStatus === 'urgent' ? 'urgent keywords' : `status ${selectedStatus}`}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Thoughts Grid/List */}
        {filteredThoughts.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredThoughts.map(thought => (
              <div 
                key={thought.id} 
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:border-primary-200 dark:hover:border-primary-600 group relative ${
                  hasUrgency(thought.content) && thought.status !== 'done' && thought.status !== 'thought'
                    ? 'shadow-red-200 dark:shadow-red-900/20 animate-pulse' 
                    : ''
                }`}
                style={{
                  boxShadow: hasUrgency(thought.content) && thought.status !== 'done' && thought.status !== 'thought'
                    ? '0 0 20px rgba(239, 68, 68, 0.8), 0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                    : undefined
                }}
              >
                {/* Urgency Indicator - positioned to not interfere with actions, hidden when task is done or is a thought */}
                {hasUrgency(thought.content) && thought.status !== 'done' && thought.status !== 'thought' && (
                  <div className="absolute top-3 left-3 z-10">
                    <div className="bg-red-500 text-white rounded-full p-1 animate-pulse">
                      <AlertTriangle className="h-3 w-3" />
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2 flex-1 mr-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(thought.category)}`}>
                      {thought.category}
                    </span>
                    {/* Show status for all thoughts */}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(thought.status)}`}>
                      {getStatusIcon(thought.status)}
                      <span className="ml-1">{thought.status}</span>
                    </span>
                  </div>
                  
                  {/* Actions Dropdown - positioned to be always clickable */}
                  <div className="relative z-20">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === thought.id ? null : thought.id)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                      disabled={isUpdating === thought.id}
                    >
                      {isUpdating === thought.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                      ) : (
                        <MoreVertical className="h-4 w-4" />
                      )}
                    </button>
                    
                    {activeDropdown === thought.id && (
                      <div className="absolute right-0 top-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-30 min-w-[160px]">
                        {/* Edit */}
                        <button
                          onClick={() => startEdit(thought)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 first:rounded-t-lg flex items-center space-x-2 text-gray-700 dark:text-gray-300"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        
                        {/* Move to Category - Only for non-thought items */}
                        {thought.status !== 'thought' && (
                          <button
                            onClick={() => {
                              setShowMoveModal(thought.id);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center space-x-2 text-gray-700 dark:text-gray-300"
                          >
                            <ArrowRight className="h-4 w-4" />
                            <span>Move to</span>
                          </button>
                        )}
                        
                        {/* Status Options */}
                        {getAvailableStatusOptions(thought.status, thought.category).length > 0 && (
                          <div className="border-t border-gray-100 dark:border-gray-700">
                            {getAvailableStatusOptions(thought.status, thought.category).map(status => (
                              <button
                                key={status}
                                onClick={() => updateThoughtStatus(thought.id, status as any)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-700 dark:text-gray-300"
                              >
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(status)}
                                  <span className="capitalize">Mark as {status}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {/* Delete */}
                        <div className="border-t border-gray-100 dark:border-gray-700">
                          <button
                            onClick={() => {
                              setDeleteConfirm(thought.id);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 last:rounded-b-lg flex items-center space-x-2 text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Content - Editable */}
                {editingThought === thought.id ? (
                  <div className="mb-4">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-sm leading-relaxed resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => saveEdit(thought.id)}
                        disabled={isUpdating === thought.id || !editContent.trim()}
                        className="flex items-center space-x-1 bg-primary-500 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-primary-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="h-3 w-3" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center space-x-1 bg-gray-500 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-gray-600 transition-colors duration-200"
                      >
                        <X className="h-3 w-3" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-200">
                    {thought.content}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(thought.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No thoughts found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All'
                ? 'Try adjusting your search terms or filters' 
                : 'Start by capturing your first thought!'}
            </p>
            {!searchTerm && selectedCategory === 'All' && selectedStatus === 'All' && (
              <button
                onClick={() => setShowThoughtInput(true)}
                className="bg-gradient-to-r from-primary-500 to-lavender-500 text-white px-6 py-3 rounded-xl font-medium hover:from-primary-600 hover:to-lavender-600 transition-all duration-200"
              >
                Capture Your First Thought
              </button>
            )}
          </div>
        )}
      </div>

      {/* Move Category Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Move to Category</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select a new category for this thought:</p>
            
            <div className="grid grid-cols-2 gap-2 mb-6">
              {MOVE_CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => moveThoughtToCategory(showMoveModal, category)}
                  disabled={isUpdating === showMoveModal}
                  className="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white"
                >
                  <span className="capitalize font-medium">{category}</span>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowMoveModal(null)}
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Thought</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone.</p>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                {thoughts.find(t => t.id === deleteConfirm)?.content}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => deleteThought(deleteConfirm)}
                disabled={isUpdating === deleteConfirm}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating === deleteConfirm ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
};

export default Dashboard;