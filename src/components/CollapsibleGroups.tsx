import React, { useState } from 'react';

interface GroupMember {
  address: string;
  role: 'admin' | 'member';
  joinedAt: number;
}

interface Group {
  id: string;
  name: string;
  description: string;
  members: GroupMember[];
  createdBy: string;
  createdAt: number;
}

interface Props {
  groups: Group[];
  selectedGroup: string | null;
  onGroupSelect: (groupId: string) => void;
  onCreateGroup: () => void;
}

export default function CollapsibleGroups({ groups, selectedGroup, onGroupSelect, onCreateGroup }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-6">
      <div 
        className="flex justify-between items-center mb-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <span className="mr-2 text-gray-600">
            {isExpanded ? '▼' : '▶'}
          </span>
          <h3 className="font-semibold text-gray-700">Groups ({groups.length})</h3>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCreateGroup();
          }}
          className="text-gray-400 hover:text-gray-600"
          title="Create New Group"
        >
          <span className="text-xl">➕</span>
        </button>
      </div>
      
      {isExpanded && (
        <div className="space-y-2">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => onGroupSelect(group.id)}
              className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors
                ${selectedGroup === group.id ? "bg-indigo-50 border border-indigo-100" : "bg-white border"}`}
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                <span className="text-gray-500 text-lg">
                  {group.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{group.name}</div>
                <div className="text-xs text-gray-500">
                  {group.members.length} members
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}