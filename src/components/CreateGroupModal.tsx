import React, { useState } from 'react';
import Gun from 'gun';

const gun = Gun();

interface Props {
  currentUser: string;
  contacts: string[];
  onClose: () => void;
  onGroupCreated: (groupId: string) => void;
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

export default function CreateGroupModal({ currentUser, contacts, onClose, onGroupCreated }: Props) {
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
            address: currentUser,
            role: 'admin' as const,
            joinedAt: Date.now()
          },
          ...selectedMembers.map(member => ({
            address: member,
            role: 'member' as const,
            joinedAt: Date.now()
          }))
        ],
        createdBy: currentUser,
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
        currentUser,
        ...selectedMembers
      ].map(member => 
        new Promise<void>((resolve, reject) => {
          gun.get('user_groups')
            .get(member)
            .get(groupId)
            .put({
              id: groupId,
              joinedAt: Date.now(),
              role: member === currentUser ? 'admin' : 'member'
            }, ack => {
              if ('err' in ack && ack.err) reject(new Error(String(ack.err)));
              resolve();
            });
        })
      ));

      // Send welcome message
      const welcomeMsg = {
        sender: 'system',
        text: `Group "${groupName}" created by ${currentUser}`,
        timestamp: Date.now(),
        type: 'system'
      };
      
      gun.get(groupId).get('messages').set(welcomeMsg);

      onGroupCreated(groupId);
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
      <div className="bg-white rounded-lg p-6 w-[480px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Create New Group</h2>

        {/* Group Avatar Upload */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300">
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
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter group description"
            rows={3}
          />
        </div>

        {/* Member Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Members ({selectedMembers.length} selected)
          </label>
          <div className="max-h-48 overflow-y-auto border rounded-lg">
            {contacts.map(contact => (
              <label 
                key={contact} 
                className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
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
                  className="mr-3"
                />
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                    {contact.slice(2, 4).toUpperCase()}
                  </div>
                  <span className="text-sm">{contact}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-700"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={isLoading || !groupName.trim()}
            className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${
              isLoading || !groupName.trim() 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}
















