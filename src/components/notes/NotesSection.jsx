import React, { useState, useEffect } from 'react';
import { teamMembers } from '../../utils/teamMembers';
import { Note } from './Note';
import { Send, MessageSquare } from 'lucide-react';

export default function NotesSection({ candidateId }) {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      const response = await fetch(`/api/candidates/${candidateId}/notes`);
      if (response.ok) setNotes(await response.json());
    };
    fetchNotes();
  }, [candidateId]);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setNewNote(text);

    const mentionMatch = text.match(/@(\w*)$/);
    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      setSuggestions(
        teamMembers.filter(member => member.name.toLowerCase().includes(query))
      );
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (member) => {
    const textBefore = newNote.substring(0, newNote.lastIndexOf('@'));
    setNewNote(`${textBefore}@${member.name} `);
    setSuggestions([]);
    document.getElementById('note-input').focus();
  };

  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (newNote.trim() === '') return;
    setIsSubmitting(true);

    const response = await fetch(`/api/candidates/${candidateId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote }),
    });

    if (response.ok) {
        const savedNote = await response.json();
        setNotes([savedNote, ...notes]);
        setNewNote('');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-lg animate-slide-in-right delay-200">
      <h2 className="text-2xl font-semibold mb-6 flex items-center">
        <MessageSquare size={24} className="mr-3 text-purple-400" />
        Notes & Mentions
      </h2>
      <form onSubmit={handleSubmitNote} className="relative">
        <textarea
          id="note-input"
          value={newNote}
          onChange={handleInputChange}
          placeholder="Add a note... type @ to mention a colleague"
          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          rows="3"
        />
        <button
            type="submit"
            className="absolute right-3 bottom-3 p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white disabled:bg-slate-600 transition-colors"
            disabled={!newNote.trim() || isSubmitting}
        >
            <Send size={16} />
        </button>

        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full sm:w-64 bg-slate-800 border border-slate-600 rounded-lg shadow-xl mt-1 overflow-hidden">
            <ul>
              {suggestions.map(member => (
                <li key={member.id} onClick={() => handleSuggestionClick(member)} className="px-4 py-2 hover:bg-slate-700 cursor-pointer">
                  <p className="font-semibold text-white">{member.name}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
      <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">
        {notes.map(note => <Note key={note.id} note={note} />)}
      </div>
    </div>
  );
}