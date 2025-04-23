import React, { useState } from 'react'; // Added useState for settings

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
  // Assume a function to handle leaving group is passed as prop
  onLeaveGroup?: (groupId: string) => void;
  // Assume functions for admin actions are passed as props
  onToggleAdminSetting?: (settingKey: keyof GroupData['settings'], value: boolean) => void;
  onRemoveMember?: (memberAddress: string) => void;
}

export default function GroupInfoModal({
  group,
  currentUser,
  onClose,
  onLeaveGroup,
  onToggleAdminSetting,
  onRemoveMember,
}: Props) {
  const isCurrentUserAdmin = group.members.some(
    (member) => member.address === currentUser && member.role === 'admin'
  );

  // State to manage local changes to settings before saving (optional, depending on implementation)
  const [groupSettings, setGroupSettings] = useState(group.settings);

  const handleToggleSetting = (settingKey: keyof GroupData['settings'], value: boolean) => {
    // Call parent function to handle the actual setting update via GunDB
    if (onToggleAdminSetting) {
      onToggleAdminSetting(settingKey, value);
    }
    // Update local state for immediate UI feedback (optional)
    setGroupSettings(prev => ({ ...prev!, [settingKey]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Added z-50 for modal */} 
      <div className="bg-white rounded-lg p-6 w-96 max-w-md shadow-lg">
        {/* Added max-w-md and shadow */} 
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{group.name}</h2>
          {/* Updated text color */} 
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
            {/* Updated text color and size */} 
            ✕
          </button>
        </div>

        {group.description && (
           <p className="text-gray-600 mb-4 text-sm">{group.description}</p>
           /* Updated text color and size */
        )}
       
        {/* --- Your Settings in this Group (Example) --- */}
        <div className="mb-4 pb-4 border-b border-gray-200">
           <h3 className="font-semibold mb-3 text-gray-900">Your Settings</h3>
           {/* Example setting: Mute notifications */} 
           <div className="flex items-center justify-between text-sm text-gray-800">
             <span>Mute Notifications</span>
             {/* Replace with actual toggle component if needed */} 
             <input type="checkbox" className="form-checkbox text-blue-600" />
           </div>
           {/* Add more personal settings here */} 
        </div>

        {/* --- Members List --- */}
        <div className="mb-4 pb-4 border-b border-gray-200 max-h-40 overflow-y-auto pr-2">
          <h3 className="font-semibold mb-2 text-gray-900">Members ({group.members.length})</h3>
          <div className="space-y-2">
            {group.members.map(member => (
              <div key={member.address} className="flex justify-between items-center text-sm">
                {/* Added text-sm */} 
                <span className="text-gray-700 font-medium">{member.address}</span>
                 {/* Updated text color and weight */} 
                {member.role && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                    {/* Added styling for role */} 
                    {member.role}
                  </span>
                )}
                 {/* Admin action: Remove Member */} 
                {isCurrentUserAdmin && member.address !== currentUser && onRemoveMember && (
                   <button 
                     onClick={() => onRemoveMember(member.address)} 
                     className="text-red-600 hover:text-red-800 text-xs ml-2"
                     title="Remove Member"
                    >
                      Remove
                    </button>
                 )}
              </div>
            ))}
          </div>
        </div>

        {/* --- Admin Settings (Conditional) --- */}
        {isCurrentUserAdmin && groupSettings && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <h3 className="font-semibold mb-3 text-gray-900">Admin Settings</h3>
            <div className="space-y-2 text-sm text-gray-800">
              {/* Example setting: Only Admins Can Post */} 
              <div className="flex items-center justify-between">
                <span>Only Admins Can Post</span>
                <input 
                  type="checkbox" 
                  className="form-checkbox text-blue-600"
                  checked={groupSettings.onlyAdminsCanPost}
                  onChange={(e) => handleToggleSetting('onlyAdminsCanPost' as keyof GroupData['settings'], e.target.checked)}
                 />
              </div>
              {/* Example setting: Only Admins Can Add Members */} 
               <div className="flex items-center justify-between">
                <span>Only Admins Can Add Members</span>
                <input 
                  type="checkbox" 
                  className="form-checkbox text-blue-600"
                   checked={groupSettings.onlyAdminsCanAddMembers}
                  onChange={(e) => handleToggleSetting('onlyAdminsCanAddMembers' as keyof GroupData['settings'], e.target.checked)}
                 />
              </div>
              {/* Example setting: Only Admins Can Edit Info */} 
               <div className="flex items-center justify-between">
                <span>Only Admins Can Edit Info</span>
                <input 
                  type="checkbox" 
                  className="form-checkbox text-blue-600"
                   checked={groupSettings.onlyAdminsCanEditInfo}
                  onChange={(e) => handleToggleSetting('onlyAdminsCanEditInfo' as keyof GroupData['settings'], e.target.checked)}
                 />
              </div>
              {/* Add more admin settings here */} 
            </div>
          </div>
        )}

        {/* --- Leave Group Button --- */}
        <div className="mt-4 text-right">
          {/* Add condition to not show Leave Group if it's a 1-on-1 chat */} 
          {onLeaveGroup && (
             <button 
               onClick={() => onLeaveGroup(group.id)} 
               className="text-red-600 hover:text-red-800 font-medium"
             >
               Leave Group
             </button>
          )}
        </div>
      </div>
    </div>
  );
}

