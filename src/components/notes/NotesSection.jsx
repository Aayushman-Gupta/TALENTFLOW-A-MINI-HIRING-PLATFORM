import React, { useState } from "react";
import { teamMembers } from "../../utils/teamMembers";
import { Send, MessageSquare } from "lucide-react";

// UPDATED: Component now takes both candidateId and jobId
export default function NotesSection({ candidateId, jobId, onNoteAdded }) {
  const [newNote, setNewNote] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setNewNote(text);

    const mentionMatch = text.match(/@(\w*)$/);
    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      setSuggestions(
        teamMembers.filter((member) =>
          member.name.toLowerCase().includes(query)
        )
      );
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (member) => {
    const textBefore = newNote.substring(0, newNote.lastIndexOf("@"));
    setNewNote(`${textBefore}@${member.name} `);
    setSuggestions([]);
    document.getElementById("note-input").focus();
  };

  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (newNote.trim() === "" || !jobId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/candidates/${candidateId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newNote,
          jobId: jobId // Include jobId in the payload
        }),
      });

      if (response.ok) {
        const savedNote = await response.json();
        onNoteAdded(savedNote); // Notify parent component of the new note
        setNewNote("");
        setSuggestions([]);
      } else {
        console.error('Failed to save note:', await response.text());
        alert('Failed to save note. Please try again.');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/60 backdrop-blur-lg rounded-2xl border border-gray-700/30 p-6 shadow-2xl animate-slide-in-left delay-200 hover:shadow-purple-500/10 transition-all duration-300">
      <h2 className="text-2xl font-bold mb-6 flex items-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
        <MessageSquare
          size={24}
          className="mr-3 text-purple-400 animate-pulse"
        />
        Add a Note
      </h2>
      <form onSubmit={handleSubmitNote} className="relative group">
        <textarea
          id="note-input"
          value={newNote}
          onChange={handleInputChange}
          placeholder="Type @ to mention a colleague..."
          className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl p-4 pr-14 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:outline-none transition-all duration-300 resize-none hover:bg-slate-800/70 placeholder:text-slate-400"
          rows="3"
        />
        <button
          type="submit"
          className={`absolute right-3 bottom-3 p-2.5 rounded-xl text-white transition-all duration-300 transform ${
            !newNote.trim() || isSubmitting || !jobId
              ? "bg-slate-600 scale-95 opacity-60 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500 to-blue-500 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95"
          } ${isSubmitting ? "animate-spin" : ""}`}
          disabled={!newNote.trim() || isSubmitting || !jobId}
        >
          <Send size={16} />
        </button>
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full sm:w-64 bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-xl shadow-2xl mt-2 overflow-hidden animate-fadeIn">
            <ul className="max-h-48 overflow-y-auto">
              {suggestions.map((member) => (
                <li
                  key={member.id}
                  onClick={() => handleSuggestionClick(member)}
                  className="px-4 py-3 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20 cursor-pointer transition-all duration-200 border-b border-slate-700/30 last:border-0"
                >
                  <p className="font-medium text-white flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    {member.name}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
      {!jobId && (
        <p className="text-red-400 text-xs mt-2">Please select a job to add notes</p>
      )}
    </div>
  );
}