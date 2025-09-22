import React from 'react';
import { teamMembers } from '../../utils/teamMembers';

const renderNoteContent = (content) => {
  return content.split(/(@[a-zA-Z\s]+)/g).map((part, index) => {
    if (part.startsWith('@')) {
      const name = part.substring(1).trim();
      if (teamMembers.some(m => m.name === name)) {
        return (
          <span key={index} className="bg-blue-500/20 text-blue-300 font-semibold px-1.5 py-0.5 rounded">
            @{name}
          </span>
        );
      }
    }
    return part;
  });
};

export function Note({ note }) {
  const author = teamMembers.find(m => m.id === note.authorId) || { name: 'System' };
  return (
    <div className="bg-slate-700/40 p-4 rounded-lg border border-slate-600/50">
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-sm text-white">{author.name}</p>
        <p className="text-xs text-slate-400">{new Date(note.createdAt).toLocaleString()}</p>
      </div>
      <p className="text-sm text-slate-300 whitespace-pre-wrap">{renderNoteContent(note.content)}</p>
    </div>
  );
}