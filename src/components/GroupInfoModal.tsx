import React from 'react';

interface GroupMember {
  address: string;
  role: 'admin' | 'member';
  joinedAt: number;
}

interface GroupData {
  id: string;
  name: string;
  description: string;
  members: GroupMember[];
  createdBy: string;
  createdAt: number;
  settings?: {
    onlyAdminsCanPost: boolean;
    onlyAdminsCanAddMembers: boolean;
    onlyAdminsCanEditInfo: boolean;
  };
}

interface Props {
  group: GroupData;
  currentUser: string;
  onClose: () => void;
}

export default function GroupInfoModal({ group, currentUser, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{group.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">{group.description}</p>
        
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Members ({group.members.length})</h3>
          <div className="space-y-2">
            {group.members.map(member => (
              <div key={member.address} className="flex justify-between items-center">
                <span className="text-gray-700">{member.address}</span>
                <span className="text-sm text-gray-500">{member.role}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          Created by: {group.createdBy}
          <br />
          Created at: {new Date(group.createdAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}