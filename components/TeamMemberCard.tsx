'use client';

import React from 'react';
import { User } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  avatar?: string;
  bio?: string;
}

interface TeamMemberCardProps {
  member: TeamMember;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  // إخفاء الصور الوهمية تماماً
  const hasValidAvatar = member.avatar && 
    !member.avatar.includes('ui-avatars.com') &&
    !member.avatar.includes('placeholder') &&
    !member.avatar.includes('faker') &&
    !member.avatar.includes('unsplash.com');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        {/* عرض الصورة فقط إذا كانت حقيقية */}
        {hasValidAvatar ? (
          <img
            src={member.avatar}
            alt={member.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <User className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {member.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {member.role}
          </p>
          {member.email && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {member.email}
            </p>
          )}
        </div>
      </div>
      
      {/* عرض النبذة فقط إذا كانت موجودة وحقيقية */}
      {member.bio && 
       !member.bio.includes('Lorem ipsum') && 
       !member.bio.includes('placeholder') && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {member.bio}
          </p>
        </div>
      )}
    </div>
  );
}

export default TeamMemberCard;