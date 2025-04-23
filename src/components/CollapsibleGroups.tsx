import React, { useState, useEffect } from 'react'; // Added useEffect
import { IGunInstance } from 'gun/types';
import { Dispatch, SetStateAction } from 'react';

// Assuming Group interface is defined elsewhere or needs to be defined here
// Based on previous file content, it was defined here, so keeping it.
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
  // Added optional lastMessage and settings based on CreateGroupModal
  lastMessage?: {
    text: string;
    sender: string;
    timestamp: number;
    type?: string; // Added optional type
  };
  settings?: {
    onlyAdminsCanPost: boolean;
    onlyAdminsCanAddMembers: boolean;
    onlyAdminsCanEditInfo: boolean;
  };
}

interface Props {
  gun: IGunInstance<any>;
  account: string;
  currentChat: string | null; // Added currentChat prop
  setCurrentChat: Dispatch<SetStateAction<string>>; // Kept setCurrentChat prop
  // showCreateGroup is passed but not directly used in UI logic here, keeping for completeness if needed later.
  showCreateGroup: boolean;
  setShowCreateGroup: Dispatch<SetStateAction<boolean>>; // Kept setShowCreateGroup prop
  userGroups: Group[]; // Added userGroups prop
}

export default function CollapsibleGroups({
  gun,
  account,
  currentChat, // Using currentChat
  setCurrentChat, // Using setCurrentChat
  setShowCreateGroup, // Using setShowCreateGroup
  userGroups // Using userGroups
}: Props) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Note: This component now relies on userGroups being passed down from App.tsx.
  // The logic for fetching these groups using gun and account should reside in App.tsx or a hook.

  return (
    <div className="w-80 flex-none border-r p-4 bg-white">
      {/* Adjusted padding and added background */}
      <div className="mb-6">
        <div
          className="flex justify-between items-center mb-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center">
            <span className="mr-2 text-gray-600">{isExpanded ? '▼' : '▶'}</span>
            <h3 className="font-semibold text-gray-900">Groups ({userGroups.length})</h3>
            {/* Updated text color and used userGroups.length */}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCreateGroup(true); // Call setShowCreateGroup
            }}
            className="text-gray-600 hover:text-gray-800"
            title="Create New Group"
          >
            <span className="text-xl">➕</span>
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-2">
            {userGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => setCurrentChat(group.id)} // Call setCurrentChat
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors
                  ${currentChat === group.id // Compare with currentChat
                    ? "bg-blue-100 border border-blue-200" // Selected style
                    : "bg-white border border-gray-300 hover:bg-gray-100" // Default and hover style
                  }`}
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3 text-gray-600">
                  {/* Updated placeholder background and text color */}
                  <span className="text-lg font-medium">
                    {group.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{group.name}</div>
                  {/* Updated text color */}
                  <div className="text-xs text-gray-600">
                    {group.members.length} members
                  </div>
                  {/* Updated text color */}
                </div>
              </div>
            ))}
             {/* Placeholder if no groups */} 
            {userGroups.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-4">
                No groups yet. Create one!
              </div>
            )}
          </div>
        )}
      </div>
       {/* You might add Contacts section here later */} 
      {/* <div className="mb-6"> ... Contacts ... </div> */} 
    </div>
  );
}