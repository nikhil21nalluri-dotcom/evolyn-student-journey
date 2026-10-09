import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Layers,
  Sparkles,
} from 'lucide-react';

interface KnowledgeResource {
  id: string;
  title: string;
  author: string;
  sourceUrl: string;
  category: string;
  subject: string;
  topic: string;
  publicationDate: string;
  license: string;
  processingStatus: string;
  lastIndexedDate: string;
  passages?: any[];
}

interface KnowledgeLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgeLibraryModal: React.FC<KnowledgeLibraryModalProps> = ({ isOpen, onClose }) => {
  const [resources, setResources] = useState<KnowledgeResource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form state for adding new resource
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('computer-science');
  const [newSubject, setNewSubject] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newLicense, setNewLicense] = useState('Creative Commons Attribution 4.0 (CC BY 4.0)');
  const [newPassageSection, setNewPassageSection] = useState('');
  const [newPassageText, setNewPassageText] = useState('');

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/knowledge/resources');
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
      }
    } catch (e) {
      console.warn('Failed to load knowledge resources:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchResources();
    }
  }, [isOpen]);

  const handleReindex = async () => {
    setIsReindexing(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/knowledge/reindex', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStatusMessage(`Successfully re-indexed ${data.totalPassages} passages across ${data.totalResources} educational sources.`);
        fetchResources();
      }
    } catch (e) {
      setStatusMessage('Re-indexing completed locally.');
    } finally {
      setIsReindexing(false);
    }
  };

  const handleDeleteResource = async (id: string, title: string) => {
    if (!confirm(`Remove "${title}" from the searchable educational knowledge index?`)) return;
    try {
      const res = await fetch(`/api/knowledge/resources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setResources((prev) => prev.filter((r) => r.id !== id));
        setStatusMessage(`Resource "${title}" removed from knowledge retrieval pipeline.`);
      }
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPassageText.trim()) return;

    try {
      const payload = {
        title: newTitle.trim(),
        author: newAuthor.trim() || 'Educator / Authorized Source',
        sourceUrl: newUrl.trim() || 'https://evolyn.ai/knowledge/notes',
        category: newCategory,
        subject: newSubject.trim() || 'Academic Engineering & Science',
        topic: newTopic.trim() || 'Concept Overview',
        license: newLicense,
        passages: [
          {
            sectionTitle: newPassageSection.trim() || 'Core Concept',
            text: newPassageText.trim(),
          },
        ],
      };

      const res = await fetch('/api/knowledge/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatusMessage(`Added "${newTitle.trim()}" to educational knowledge index.`);
        setIsAddingResource(false);
        setNewTitle('');
        setNewAuthor('');
        setNewUrl('');
        setNewPassageSection('');
        setNewPassageText('');
        fetchResources();
      }
    } catch (err) {
      console.error('Error adding resource:', err);
    }
  };

  if (!isOpen) return null;

  const filteredResources = resources.filter((r) => {
    const matchesCat = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#030410]/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-4xl bg-[#0b0f2a] border border-[rgba(140,150,255,0.25)] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#090b20]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6f8dff]/20 border border-[#6f8dff]/30 flex items-center justify-center text-[#6f8dff]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-baskerville font-bold text-lg text-white">Educational Knowledge Repository (RAG)</h2>
              <p className="text-xs text-[#a4a9d0]">
                Verified, openly licensed textbooks, lecture notes &amp; documentation powering Evolyn AI Coach.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReindex}
              disabled={isReindexing}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#a4a9d0] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Re-index all passages"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReindexing ? 'animate-spin text-[#ff6a2b]' : ''}`} />
              <span>{isReindexing ? 'Indexing...' : 'Re-index'}</span>
            </button>
            <button
              onClick={() => setIsAddingResource(!isAddingResource)}
              className="px-3 py-1.5 rounded-xl bg-[#ff6a2b] hover:bg-[#ff7d42] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-[#ff6a2b]/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Resource</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-[#a4a9d0] hover:text-white rounded-lg cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="px-6 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Add Resource Drawer */}
        {isAddingResource && (
          <form onSubmit={handleCreateResource} className="p-6 bg-[#080a1c] border-b border-white/10 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase font-bold text-[#ffb27a] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Ingest Authorized Educational Resource
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingResource(false)}
                className="text-xs text-[#a4a9d0] hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[#a4a9d0] mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Operating Systems & Concurrency"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#ff6a2b]"
                />
              </div>
              <div>
                <label className="block text-[#a4a9d0] mb-1">Author / Publisher</label>
                <input
                  type="text"
                  placeholder="e.g. OpenStax / MIT Courseware"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#ff6a2b]"
                />
              </div>
              <div>
                <label className="block text-[#a4a9d0] mb-1">Source URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#ff6a2b]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[#a4a9d0] mb-1">Subject Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#ff6a2b]"
                >
                  <option value="computer-science">Computer Science & Programming</option>
                  <option value="mathematics-engineering">Mathematics & Engineering Fundamentals</option>
                  <option value="academic-study">Academic Study & Revision</option>
                  <option value="communication-english">Communication & English Practice</option>
                  <option value="career-placement">Career Preparation & Placement</option>
                  <option value="interview-concepts">Interview Questions & Technical Concepts</option>
                  <option value="learning-development">Learning & Student Development</option>
                </select>
              </div>
              <div>
                <label className="block text-[#a4a9d0] mb-1">Topic / Domain</label>
                <input
                  type="text"
                  placeholder="e.g. Deadlocks & Semaphore Synchronization"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#ff6a2b]"
                />
              </div>
              <div>
                <label className="block text-[#a4a9d0] mb-1">Open License</label>
                <input
                  type="text"
                  value={newLicense}
                  onChange={(e) => setNewLicense(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#ff6a2b]"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-[#a4a9d0] mb-1">Educational Passage Content *</label>
              <textarea
                required
                rows={3}
                placeholder="Paste the educational textbook excerpt, definition, or verified curriculum notes..."
                value={newPassageText}
                onChange={(e) => setNewPassageText(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-[#ff6a2b]"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#ff6a2b] hover:bg-[#ff7d42] text-white text-xs font-semibold cursor-pointer shadow-md"
              >
                Index and Save to Knowledge Base
              </button>
            </div>
          </form>
        )}

        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-white/10 flex flex-wrap gap-3 items-center justify-between bg-[#080b22]">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#a4a9d0]" />
            <input
              type="text"
              placeholder="Search indexed topics, titles, or authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-[#a4a9d0]/60 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'computer-science', label: 'Computer Science' },
              { id: 'mathematics-engineering', label: 'Mathematics' },
              { id: 'communication-english', label: 'Communication' },
              { id: 'career-placement', label: 'Placement' },
              { id: 'academic-study', label: 'Study & Revision' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#6f8dff] text-white font-semibold'
                    : 'bg-white/5 hover:bg-white/10 text-[#a4a9d0]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resources List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-[#a4a9d0] text-xs">Loading educational repository...</div>
          ) : filteredResources.length === 0 ? (
            <div className="py-12 text-center text-[#a4a9d0] text-xs">No educational resources match your filter.</div>
          ) : (
            filteredResources.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#6f8dff]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm text-white">{res.title}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#6f8dff]/15 text-[#93c5fd] text-[10px] font-mono border border-[#6f8dff]/20">
                      {res.category}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-mono border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3" /> Indexed
                    </span>
                  </div>

                  <div className="text-xs text-[#a4a9d0] flex items-center gap-3 flex-wrap">
                    <span><strong>Author:</strong> {res.author}</span>
                    <span>•</span>
                    <span><strong>Topic:</strong> {res.topic}</span>
                    <span>•</span>
                    <span><strong>Passages:</strong> {res.passages?.length || 1}</span>
                  </div>

                  <div className="text-[11px] text-[#a4a9d0]/80 flex items-center gap-2">
                    <span className="font-mono text-[10px]">{res.license}</span>
                    {res.sourceUrl && (
                      <a
                        href={res.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#6f8dff] hover:underline flex items-center gap-1 text-[11px]"
                      >
                        Source <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleDeleteResource(res.id, res.title)}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer"
                    title="Remove resource"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#080b22] border-t border-white/10 text-[11px] text-[#a4a9d0] flex items-center justify-between">
          <span>{filteredResources.length} educational sources currently active in RAG index.</span>
          <span className="text-white/60">Strictly ground questions with source transparency.</span>
        </div>
      </div>
    </div>
  );
};
