//CreateGroupModal.tsx
import React, { useState } from 'react';
// Removed: import Gun from 'gun';
import { IGunInstance } from 'gun/types';
import { Dispatch, SetStateAction } from 'react';

interface Props {
  gun: IGunInstance<any>;
  account: string;
  contacts?: string[];
  onClose: () => void;
  setCurrentChat: Dispatch<SetStateAction<string>>; // Renamed onGroupCreated to setCurrentChat
}

interface GroupMember {
  address: string;
  role: 'admin' | 'member';
  joinedAt: number;
}

interface GroupData {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  members: GroupMember[];
  createdBy: string;
  createdAt: number;
  lastMessage?: {
    text: string;
    sender: string;
    timestamp: number;
  };
  settings: {
    onlyAdminsCanPost: boolean;
    onlyAdminsCanAddMembers: boolean;
    onlyAdminsCanEditInfo: boolean;
  };
}

export default function CreateGroupModal({ gun, account, contacts = [], onClose, setCurrentChat }: Props) {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [groupAvatar, setGroupAvatar] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    setIsLoading(true);

    try {
      const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create initial group data
      const group: GroupData = {
        id: groupId,
        name: groupName.trim(),
        description: groupDescription.trim(),
        members: [
          {
            address: account,
            role: 'admin' as const,
            joinedAt: Date.now()
          },
          ...selectedMembers.map(member => ({
            address: member,
            role: 'member' as const,
            joinedAt: Date.now()
          }))
        ],
        createdBy: account,
        createdAt: Date.now(),
        settings: {
          onlyAdminsCanPost: false,
          onlyAdminsCanAddMembers: true,
          onlyAdminsCanEditInfo: true
        }
      };

      // Write group data
      await new Promise<void>((resolve, reject) => {
        gun.get('groups').get(groupId).put(group, ack => {
          if ('err' in ack && ack.err) reject(new Error(String(ack.err)));
          resolve();
        });
      });

      // Write user_groups data for all members
      await Promise.all([
        account,
        ...selectedMembers
      ].map(member =>
        new Promise<void>((resolve, reject) => {
          gun.get('user_groups')
            .get(member)
            .get(groupId)
            .put({
              id: groupId,
              joinedAt: Date.now(),
              role: member === account ? 'admin' : 'member'
            }, ack => {
              if ('err' in ack && ack.err) reject(new Error(String(ack.err)));
              resolve();
            });
        })
      ));

      // Send welcome message
      const welcomeMsg = {
        sender: 'system',
        text: `Group "${groupName}" created by ${account}`,
        timestamp: Date.now(),
        type: 'system'
      };

      gun.get(groupId).get('messages').set(welcomeMsg);

      setCurrentChat(groupId);
      onClose();

    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[480px] max-h-[90vh] overflow-y-auto shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Create New Group</h2>

        {/* Group Avatar Upload */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 text-gray-600 overflow-hidden">
            {groupAvatar ? (
              <img
                src={URL.createObjectURL(groupAvatar)}
                alt="Group avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-4xl">📷</span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setGroupAvatar(file);
              }}
            />
          </div>
        </div>

        {/* Group Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Group Name
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            placeholder="Enter group name"
          />
        </div>

        {/* Group Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            placeholder="Enter group description"
            rows={3}
          />
        </div>

        {/* Member Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Members ({selectedMembers.length} selected)
          </label>
          <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg">
            {/* Assuming contacts are available as a prop or fetched */} 
            {contacts.length > 0 ? (
              contacts.map(contact => (
                <label
                  key={contact}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(contact)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMembers([...selectedMembers, contact]);
                      } else {
                        setSelectedMembers(selectedMembers.filter(m => m !== contact));
                      }
                    }}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2 text-gray-600 text-sm font-medium">
                      {contact.slice(2, 4).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-900">{contact}</span>
                  </div>
                </label>
              ))
            ) : (
              <div className="text-center text-gray-500 text-sm py-4">
                No contacts available to add.
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={isLoading || !groupName.trim()}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isLoading || !groupName.trim()
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}

